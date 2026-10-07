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
    current = Math.max(0, Math.min(slides.length - 1, index));
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

  let touchStart = 0;
  document.querySelector('.stage').addEventListener('touchstart', e => touchStart = e.changedTouches[0].clientX, {passive:true});
  document.querySelector('.stage').addEventListener('touchend', e => {
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

  renderClassify();
  update();
})();
