(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const progressFill = document.getElementById('progressFill');
  const counter = document.getElementById('counter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const toc = document.getElementById('toc');
  const tocGrid = document.getElementById('tocGrid');
  let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#slide-', '')) - 1 || 0));

  slides.forEach((slide, i) => {
    const btn = document.createElement('button');
    btn.className = 'toc-item';
    btn.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><span>${slide.dataset.title}</span>`;
    btn.addEventListener('click', () => { go(i); closeToc(); });
    tocGrid.appendChild(btn);
  });

  function update() {
    const n = current + 1;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.classList.toggle('exit-left', i < current);
    });
    progressFill.style.width = `${(n / slides.length) * 100}%`;
    counter.textContent = `${String(n).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    document.title = `${slides[current].dataset.title} | Data and Processing`;
  }

  function go(index) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (next !== current) clearAnnotations();
    current = next;
    history.replaceState(null, '', `#slide-${current + 1}`);
    update();
  }

  const openToc = () => toc.classList.add('open');
  const closeToc = () => toc.classList.remove('open');
  document.getElementById('tocOpen').addEventListener('click', openToc);
  document.getElementById('tocClose').addEventListener('click', closeToc);
  toc.addEventListener('click', e => { if (e.target === toc) closeToc(); });
  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  document.getElementById('fullscreen').addEventListener('click', async () => {
    try { document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); } catch (_) {}
  });

  document.addEventListener('keydown', e => {
    if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(slides.length - 1);
    if (e.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
    if (e.key === 'Escape') closeToc();
  });

  // Presentation annotation / whiteboard layer
  const stage = document.querySelector('.stage');
  const annotationCanvas = document.getElementById('annotationCanvas');
  const annotationCtx = annotationCanvas ? annotationCanvas.getContext('2d') : null;
  const toolMouse = document.getElementById('toolMouse');
  const toolPen = document.getElementById('toolPen');
  const toolEraser = document.getElementById('toolEraser');
  const toolUndo = document.getElementById('toolUndo');
  const toolClear = document.getElementById('toolClear');
  const sizeDown = document.getElementById('sizeDown');
  const sizeUp = document.getElementById('sizeUp');
  const sizeValue = document.getElementById('sizeValue');
  const colorDots = [...document.querySelectorAll('.color-dot')];

  let annotationMode = 'mouse';
  let penColor = '#e53935';
  let penSize = 4;
  let annotationStrokes = [];
  let currentStroke = null;
  let drawing = false;
  let canvasCssWidth = 1;
  let canvasCssHeight = 1;

  function setAnnotationComposite(stroke) {
    annotationCtx.globalCompositeOperation = stroke.mode === 'eraser' ? 'destination-out' : 'source-over';
    annotationCtx.strokeStyle = stroke.color;
    annotationCtx.fillStyle = stroke.color;
    annotationCtx.lineWidth = stroke.mode === 'eraser' ? Math.max(18, stroke.width * 5) : stroke.width;
    annotationCtx.lineCap = 'round';
    annotationCtx.lineJoin = 'round';
  }

  function pointToPx(point) {
    return { x: point.x * canvasCssWidth, y: point.y * canvasCssHeight };
  }

  function drawAnnotationStroke(stroke) {
    if (!annotationCtx || !stroke || !stroke.points.length) return;
    setAnnotationComposite(stroke);
    if (stroke.points.length === 1) {
      const p = pointToPx(stroke.points[0]);
      annotationCtx.beginPath();
      annotationCtx.arc(p.x, p.y, annotationCtx.lineWidth / 2, 0, Math.PI * 2);
      annotationCtx.fill();
      return;
    }
    annotationCtx.beginPath();
    const start = pointToPx(stroke.points[0]);
    annotationCtx.moveTo(start.x, start.y);
    for (let i = 1; i < stroke.points.length; i++) {
      const p = pointToPx(stroke.points[i]);
      annotationCtx.lineTo(p.x, p.y);
    }
    annotationCtx.stroke();
  }

  function clearCanvasPixels() {
    if (!annotationCtx || !annotationCanvas) return;
    annotationCtx.save();
    annotationCtx.setTransform(1, 0, 0, 1, 0, 0);
    annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
    annotationCtx.restore();
  }

  function redrawAnnotations() {
    if (!annotationCtx) return;
    clearCanvasPixels();
    annotationStrokes.forEach(drawAnnotationStroke);
    annotationCtx.globalCompositeOperation = 'source-over';
  }

  function clearAnnotations() {
    annotationStrokes = [];
    currentStroke = null;
    drawing = false;
    clearCanvasPixels();
    if (annotationCtx) annotationCtx.globalCompositeOperation = 'source-over';
  }

  function resizeAnnotationCanvas() {
    if (!annotationCanvas || !annotationCtx || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvasCssWidth = Math.max(1, rect.width);
    canvasCssHeight = Math.max(1, rect.height);
    annotationCanvas.width = Math.round(canvasCssWidth * dpr);
    annotationCanvas.height = Math.round(canvasCssHeight * dpr);
    annotationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawAnnotations();
  }

  function setAnnotationMode(mode) {
    annotationMode = mode;
    if (!annotationCanvas) return;
    annotationCanvas.classList.toggle('drawing-enabled', mode !== 'mouse');
    annotationCanvas.classList.toggle('eraser-enabled', mode === 'eraser');
    [toolMouse, toolPen, toolEraser].forEach(btn => btn && btn.classList.remove('active'));
    if (mode === 'mouse' && toolMouse) toolMouse.classList.add('active');
    if (mode === 'pen' && toolPen) toolPen.classList.add('active');
    if (mode === 'eraser' && toolEraser) toolEraser.classList.add('active');
  }

  function eventPoint(e) {
    const rect = annotationCanvas.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width))),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / Math.max(1, rect.height)))
    };
  }

  if (annotationCanvas && annotationCtx) {
    annotationCanvas.addEventListener('pointerdown', e => {
      if (annotationMode === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();
      drawing = true;
      annotationCanvas.setPointerCapture?.(e.pointerId);
      currentStroke = {
        mode: annotationMode,
        color: penColor,
        width: penSize,
        points: [eventPoint(e)]
      };
    });

    annotationCanvas.addEventListener('pointermove', e => {
      if (!drawing || !currentStroke) return;
      e.preventDefault();
      const nextPoint = eventPoint(e);
      const previous = currentStroke.points[currentStroke.points.length - 1];
      currentStroke.points.push(nextPoint);
      setAnnotationComposite(currentStroke);
      const p1 = pointToPx(previous);
      const p2 = pointToPx(nextPoint);
      annotationCtx.beginPath();
      annotationCtx.moveTo(p1.x, p1.y);
      annotationCtx.lineTo(p2.x, p2.y);
      annotationCtx.stroke();
    });

    const endStroke = e => {
      if (!drawing || !currentStroke) return;
      e?.preventDefault?.();
      drawing = false;
      if (currentStroke.points.length === 1) drawAnnotationStroke(currentStroke);
      annotationStrokes.push(currentStroke);
      currentStroke = null;
      annotationCtx.globalCompositeOperation = 'source-over';
    };
    annotationCanvas.addEventListener('pointerup', endStroke);
    annotationCanvas.addEventListener('pointercancel', endStroke);
    annotationCanvas.addEventListener('contextmenu', e => { if (annotationMode !== 'mouse') e.preventDefault(); });

    toolMouse?.addEventListener('click', () => setAnnotationMode('mouse'));
    toolPen?.addEventListener('click', () => setAnnotationMode('pen'));
    toolEraser?.addEventListener('click', () => setAnnotationMode('eraser'));
    toolUndo?.addEventListener('click', () => { annotationStrokes.pop(); redrawAnnotations(); });
    toolClear?.addEventListener('click', clearAnnotations);

    colorDots.forEach(dot => dot.addEventListener('click', () => {
      penColor = dot.dataset.color || penColor;
      colorDots.forEach(x => x.classList.toggle('active', x === dot));
      setAnnotationMode('pen');
    }));

    const updatePenSize = delta => {
      penSize = Math.min(12, Math.max(2, penSize + delta));
      if (sizeValue) sizeValue.textContent = String(penSize);
    };
    sizeDown?.addEventListener('click', () => updatePenSize(-1));
    sizeUp?.addEventListener('click', () => updatePenSize(1));

    window.addEventListener('resize', resizeAnnotationCanvas);
    document.addEventListener('fullscreenchange', () => requestAnimationFrame(resizeAnnotationCanvas));
    requestAnimationFrame(resizeAnnotationCanvas);
  }

  document.addEventListener('keydown', e => {
    if (e.target.matches?.('input, textarea, select')) return;
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault();
      annotationStrokes.pop();
      redrawAnnotations();
      return;
    }
    if (key === 'd') setAnnotationMode(annotationMode === 'pen' ? 'mouse' : 'pen');
    if (key === 'e') setAnnotationMode('eraser');
    if (key === 'm') setAnnotationMode('mouse');
    if (key === 'c' && annotationMode !== 'mouse') clearAnnotations();
  });

  let touchStart = 0;
  document.querySelector('.stage').addEventListener('touchstart', e => {
    if (annotationMode !== 'mouse') return;
    touchStart = e.changedTouches[0].clientX;
  }, {passive:true});
  document.querySelector('.stage').addEventListener('touchend', e => {
    if (annotationMode !== 'mouse') return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 60) go(current + (dx < 0 ? 1 : -1));
  }, {passive:true});

  const firstCards = [...document.querySelectorAll('#firstChoiceGrid .phone-card')];
  const firstFeedback = document.getElementById('firstChoiceFeedback');
  firstCards.forEach(card => card.addEventListener('click', () => {
    firstCards.forEach(x => x.classList.remove('selected'));
    card.classList.add('selected');
    firstFeedback.innerHTML = `เลือกรุ่น <b>${card.dataset.phone}</b> — แต่เรายังไม่รู้ราคา แบตเตอรี่ ความจุ หรือรีวิวเลย <b>ข้อมูลพอหรือยัง?</b>`;
  }));

  const classifyItems = [
    {text:'เวลาเดินทางมาโรงเรียน 25 นาที',answer:'quant',reason:'วัดออกมาเป็นตัวเลขได้'},
    {text:'สีโทรศัพท์ที่ชอบคือสีฟ้า',answer:'qual',reason:'เป็นลักษณะหรือประเภท'},
    {text:'แบตเตอรี่ 6,000 mAh',answer:'quant',reason:'เป็นค่าที่วัดและเปรียบเทียบได้'},
    {text:'มือถือรุ่นนี้ใช้งานง่าย',answer:'qual',reason:'เป็นความคิดเห็น/ลักษณะ'},
    {text:'คะแนนรีวิว 4.7 จาก 5',answer:'quant',reason:'เป็นค่าตัวเลขที่นำไปเปรียบเทียบได้'}
  ];
  let classifyIndex = 0;
  const classifyPrompt = document.getElementById('classifyPrompt');
  const classifyFeedback = document.getElementById('classifyFeedback');
  const classifyProgress = document.getElementById('classifyProgress');
  const nextClassify = document.getElementById('nextClassify');
  const classifyButtons = [...document.querySelectorAll('.classify-choice')];
  function renderClassify(){
    const item = classifyItems[classifyIndex];
    classifyPrompt.textContent = item.text;
    classifyProgress.textContent = `ข้อ ${classifyIndex + 1} / ${classifyItems.length}`;
    classifyFeedback.textContent = 'เลือกคำตอบ 1 ข้อ';
    classifyButtons.forEach(b => b.classList.remove('correct','wrong'));
    nextClassify.disabled = true;
  }
  classifyButtons.forEach(btn => btn.addEventListener('click', () => {
    const item = classifyItems[classifyIndex];
    classifyButtons.forEach(b => b.classList.remove('correct','wrong'));
    const correct = btn.dataset.answer === item.answer;
    btn.classList.add(correct ? 'correct' : 'wrong');
    const rightBtn = classifyButtons.find(b => b.dataset.answer === item.answer);
    if (!correct) rightBtn.classList.add('correct');
    classifyFeedback.innerHTML = `${correct ? '✓ ถูกต้อง' : 'ลองอีกครั้ง'} — ${item.reason}`;
    nextClassify.disabled = false;
  }));
  nextClassify.addEventListener('click', () => { classifyIndex = (classifyIndex + 1) % classifyItems.length; renderClassify(); });

  const filterRows = [...document.querySelectorAll('#filterTable tbody tr')];
  document.getElementById('runFilter').addEventListener('click', () => {
    filterRows.forEach(row => {
      const ok = Number(row.dataset.price) <= 10000 && Number(row.dataset.battery) >= 5000;
      row.classList.toggle('filtered-out', !ok);
      row.classList.toggle('winner', ok);
      row.querySelector('.status').textContent = ok ? '✓ ผ่าน' : 'กรองออก';
    });
    document.getElementById('filterResult').hidden = false;
  });
  document.getElementById('resetFilter').addEventListener('click', () => {
    filterRows.forEach(row => { row.classList.remove('filtered-out','winner'); row.querySelector('.status').textContent = 'รอตรวจ'; });
    document.getElementById('filterResult').hidden = true;
  });

  const chartFeedback = document.getElementById('chartFeedback');
  const chartButtons = [...document.querySelectorAll('.chart-choice')];
  chartButtons.forEach(btn => btn.addEventListener('click', () => {
    chartButtons.forEach(x => x.classList.remove('correct','wrong'));
    if (btn.dataset.chart === 'bar') {
      btn.classList.add('correct');
      chartFeedback.innerHTML = '✓ <b>แผนภูมิแท่ง</b> เหมาะที่สุดสำหรับการเปรียบเทียบหลายหมวดหมู่';
    } else {
      btn.classList.add('wrong');
      chartButtons.find(x => x.dataset.chart === 'bar').classList.add('correct');
      chartFeedback.textContent = btn.dataset.chart === 'pie' ? 'วงกลมเหมาะกับ “สัดส่วน” มากกว่า' : 'เส้นเหมาะกับ “การเปลี่ยนแปลงตามเวลา” มากกว่า';
    }
  }));

  const finalAnswer = document.getElementById('finalAnswer');
  document.querySelectorAll('.final-choice').forEach(btn => btn.addEventListener('click', () => {
    finalAnswer.innerHTML = btn.dataset.model === 'A'
      ? '<b>ตัวอย่าง:</b> เลือก A เพราะราคา 8,990 บาท อยู่ในงบ และแบต 5,000 mAh ผ่านเงื่อนไข'
      : '<b>ตัวอย่าง:</b> เลือก B เพราะราคา 9,990 บาท อยู่ในงบ แบต 6,000 mAh และรีวิว 4.7 สูงกว่า A';
  }));

  const exitFeedback = document.getElementById('exitFeedback');
  const exitButtons = [...document.querySelectorAll('.exit-choice')];
  exitButtons.forEach(btn => btn.addEventListener('click', () => {
    exitButtons.forEach(x => x.classList.remove('correct','wrong'));
    const correct = btn.dataset.answer === 'info';
    btn.classList.add(correct ? 'correct' : 'wrong');
    exitButtons.find(x => x.dataset.answer === 'info').classList.add('correct');
    exitFeedback.innerHTML = correct ? '✓ <b>สารสนเทศ</b> เพราะผ่านการคำนวณและสรุปความหมายแล้ว' : 'คะแนนดิบเป็น “ข้อมูล” แต่ค่าเฉลี่ย 72 เป็นผลจากการประมวลผล จึงเป็น “สารสนเทศ”';
  }));



  // Pre-test and final practice
  const preQuestions = [
    {q:'ข้อใดเป็นข้อมูลเชิงปริมาณ?', options:['สีโทรศัพท์ที่ชอบ','เวลาเดินทางมาโรงเรียน 25 นาที','ความคิดเห็นว่า “กล้องสวย”'], answer:1, reason:'25 นาทีเป็นค่าที่วัดออกมาเป็นตัวเลขได้'},
    {q:'ข้อความ “มือถือรุ่นนี้ใช้งานง่าย” เป็นข้อมูลชนิดใด?', options:['ข้อมูลเชิงปริมาณ','ข้อมูลเชิงคุณภาพ','สารสนเทศ'], answer:1, reason:'เป็นความคิดเห็นหรือลักษณะ จึงเป็นข้อมูลเชิงคุณภาพ'},
    {q:'ถ้าต้องการแสดงเฉพาะมือถือราคาไม่เกิน 10,000 บาท ควรใช้วิธีใด?', options:['Filter','AVERAGE','สร้างกราฟเส้น'], answer:0, reason:'Filter ใช้แสดงเฉพาะรายการที่ตรงตามเงื่อนไข'},
    {q:'ถ้าต้องการเปรียบเทียบจำนวนผู้เลือกมือถือ A / B / C ควรใช้กราฟใด?', options:['แผนภูมิแท่ง','แผนภูมิวงกลม','แผนภูมิเส้น'], answer:0, reason:'แผนภูมิแท่งเหมาะกับการเปรียบเทียบหลายหมวดหมู่'},
    {q:'ข้อใดอธิบายความสัมพันธ์ระหว่างข้อมูลกับ AI ได้เหมาะสมที่สุด?', options:['ข้อมูลไม่สำคัญ เพราะ AI คิดเองได้','ข้อมูลที่ถูกต้องและครบ ช่วยให้ AI ทำงานน่าเชื่อถือขึ้น','ยิ่งใส่ข้อมูลเยอะเท่าไรก็ถูกเสมอ'], answer:1, reason:'AI อาศัยข้อมูลที่ป้อนเข้า จึงควรใช้ข้อมูลที่ถูกต้อง ครบ และตรงคำถาม'}
  ];

  function setupLessonQuiz(prefix, questions, storageKey, compareKey = null) {
    const questionEl = document.getElementById(`${prefix}QuizQuestion`);
    const optionsEl = document.getElementById(`${prefix}QuizOptions`);
    const progressEl = document.getElementById(`${prefix}QuizProgress`);
    const feedbackEl = document.getElementById(`${prefix}QuizFeedback`);
    const nextEl = document.getElementById(`${prefix}QuizNext`);
    const scoreMini = document.getElementById(`${prefix}QuizScoreMini`);
    if (!questionEl || !optionsEl || !progressEl || !feedbackEl || !nextEl) return;

    let index = 0, score = 0, answered = false, finished = false;
    const readStored = key => { try { const v = localStorage.getItem(key); return v === null ? null : Number(v); } catch (_) { return null; } };
    const saveStored = (key,val) => { try { localStorage.setItem(key,String(val)); } catch (_) {} };

    function render() {
      const item = questions[index];
      answered = false;
      progressEl.textContent = `ข้อ ${index + 1} / ${questions.length}`;
      questionEl.textContent = item.q;
      optionsEl.innerHTML = '';
      feedbackEl.className = 'lesson-quiz-feedback';
      feedbackEl.textContent = 'เลือกคำตอบ 1 ข้อ';
      nextEl.disabled = true;
      nextEl.textContent = index === questions.length - 1 ? 'ดูคะแนน' : 'ข้อต่อไป →';
      item.options.forEach((text, optIndex) => {
        const btn = document.createElement('button');
        btn.className = 'lesson-quiz-option';
        btn.textContent = `${String.fromCharCode(65 + optIndex)}. ${text}`;
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = optIndex === item.answer;
          if (correct) score++;
          [...optionsEl.children].forEach((b,i) => b.classList.toggle('correct', i === item.answer));
          if (!correct) btn.classList.add('wrong');
          feedbackEl.innerHTML = `${correct ? '✓ ถูกต้อง' : '✗ ยังไม่ถูก'} — ${item.reason}`;
          nextEl.disabled = false;
        });
        optionsEl.appendChild(btn);
      });
    }

    function showResult() {
      finished = true;
      saveStored(storageKey, score);
      progressEl.textContent = `ครบ ${questions.length} ข้อ`;
      questionEl.textContent = 'คะแนนก่อนเรียน';
      optionsEl.innerHTML = '';
      feedbackEl.className = 'lesson-quiz-feedback result';
      let extra = '';
      if (compareKey) {
        const before = readStored(compareKey);
        if (before !== null) {
          const diff = score - before;
          extra = `<br>ก่อนเรียน ${before}/${questions.length} → ท้ายบท ${score}/${questions.length} ${diff > 0 ? `· เพิ่มขึ้น ${diff} คะแนน` : diff === 0 ? '· คะแนนเท่าเดิม' : `· ลดลง ${Math.abs(diff)} คะแนน`}`;
        }
      }
      feedbackEl.innerHTML = `<b>${score}/${questions.length} คะแนน</b>${extra}`;
      scoreMini.textContent = score >= 4 ? 'ทำได้ดีมาก' : score >= 3 ? 'ผ่านเกณฑ์พื้นฐาน' : 'ควรทบทวนอีกครั้ง';
      nextEl.disabled = false;
      nextEl.textContent = 'ทำใหม่';
    }

    nextEl.addEventListener('click', () => {
      if (finished) { index = 0; score = 0; finished = false; render(); return; }
      if (index < questions.length - 1) { index++; render(); }
      else showResult();
    });
    render();
  }

  setupLessonQuiz('pre', preQuestions, 'unit5PretestScore');

  renderClassify();
  update();
})();
