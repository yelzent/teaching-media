(() => {
      const slides = [...document.querySelectorAll('.slide')];
      const progressFill = document.getElementById('progressFill');
      const counter = document.getElementById('counter');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const toc = document.getElementById('toc');
      const tocGrid = document.getElementById('tocGrid');
      const note = document.getElementById('presenterNote');
      const noteText = document.getElementById('noteText');
      const initialSlide = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#slide-', '')) - 1 || 0));
      let current = -1;

      slides.forEach((slide, i) => {
        const btn = document.createElement('button');
        btn.className = 'toc-item';
        btn.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><span>${slide.dataset.title}</span>`;
        btn.addEventListener('click', () => { go(i); closeToc(); });
        tocGrid.appendChild(btn);
      });

      function go(index, pushHash = true) {
        const next = Math.max(0, Math.min(slides.length - 1, index));
        if (next === current && slides[current].classList.contains('active')) { update(); return; }
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === next);
          slide.classList.toggle('exit-left', i < next);
          if (i === next) slide.scrollTop = 0;
        });
        current = next;
        if (pushHash) history.replaceState(null, '', `#slide-${current + 1}`);
        update();
      }

      function update() {
        const n = current + 1;
        progressFill.style.width = `${(n / slides.length) * 100}%`;
        counter.textContent = `${String(n).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === slides.length - 1;
        noteText.textContent = slides[current].dataset.note || '';
        document.title = `${slides[current].dataset.title} | Data and Processing`;
      }

      const openToc = () => { toc.classList.add('open'); document.getElementById('tocClose').focus(); };
      const closeToc = () => { toc.classList.remove('open'); document.getElementById('tocOpen').focus(); };
      document.getElementById('tocOpen').addEventListener('click', openToc);
      document.getElementById('tocClose').addEventListener('click', closeToc);
      toc.addEventListener('click', e => { if (e.target === toc) closeToc(); });
      prevBtn.addEventListener('click', () => go(current - 1));
      nextBtn.addEventListener('click', () => go(current + 1));

      document.getElementById('noteToggle').addEventListener('click', () => note.classList.toggle('show'));
      document.getElementById('fullscreen').addEventListener('click', async () => {
        try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch (_) {}
      });

      document.addEventListener('keydown', e => {
        if (e.target.matches('input, button') && !['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(current + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(current - 1); }
        if (e.key === 'Home') go(0);
        if (e.key === 'End') go(slides.length - 1);
        if (e.key.toLowerCase() === 'n') note.classList.toggle('show');
        if (e.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
        if (e.key === 'Escape') { toc.classList.remove('open'); note.classList.remove('show'); }
      });

      let touchStart = 0;
      document.querySelector('.stage').addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; }, { passive: true });
      document.querySelector('.stage').addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touchStart; if (Math.abs(dx) > 60) go(current + (dx < 0 ? 1 : -1)); }, { passive: true });

      document.querySelectorAll('.sort-chip').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-chip').forEach(x => x.dataset.state = '');
        const correct = btn.dataset.answer === 'correct';
        btn.dataset.state = correct ? 'correct' : 'wrong';
        document.getElementById('typeFeedback').textContent = correct ? 'ถูกต้อง — “25 นาที” เป็นค่าที่วัดและคำนวณต่อได้' : 'ลองอีกครั้ง: ค่านี้นับหรือวัดเป็นตัวเลขได้หรือไม่?';
      }));

      const tbody = document.querySelector('#dataTable tbody');
      document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === btn));
        const rows = [...tbody.rows];
        rows.forEach(row => row.classList.remove('dim'));
        if (btn.dataset.mode === 'desc') rows.sort((a,b) => b.dataset.score - a.dataset.score);
        if (btn.dataset.mode === 'original') rows.sort((a,b) => a.dataset.order - b.dataset.order);
        if (btn.dataset.mode === 'filter') rows.forEach(row => row.classList.toggle('dim', Number(row.dataset.score) < 80));
        rows.forEach(row => tbody.appendChild(row));
      }));

      const scoreKey = 'unit5DataPretestScore';
      const readScore = () => { try { const value = localStorage.getItem(scoreKey); return value === null ? null : Number(value); } catch (_) { return null; } };
      const saveScore = value => { try { localStorage.setItem(scoreKey, String(value)); } catch (_) {} };

      function setupQuiz({ questionSelector, navId, prevId, nextId, checkId, resultId, stage }) {
        const questions = [...document.querySelectorAll(questionSelector)];
        const quizNav = document.getElementById(navId);
        let quizIndex = 0;

        questions.forEach((_, i) => {
          const b = document.createElement('button');
          b.className = 'quiz-dot';
          b.textContent = i + 1;
          b.setAttribute('aria-label', `${stage === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'} ข้อ ${i + 1}`);
          b.addEventListener('click', () => showQuestion(i));
          quizNav.appendChild(b);
        });

        function showQuestion(i) {
          quizIndex = Math.max(0, Math.min(questions.length - 1, i));
          questions.forEach((q, n) => q.classList.toggle('current', n === quizIndex));
          [...quizNav.children].forEach((b, n) => {
            b.classList.toggle('current', n === quizIndex);
            b.classList.toggle('answered', !!questions[n].querySelector('input:checked'));
          });
          document.getElementById(prevId).disabled = quizIndex === 0;
          document.getElementById(nextId).hidden = quizIndex === questions.length - 1;
          document.getElementById(checkId).hidden = quizIndex !== questions.length - 1;
        }

        document.getElementById(prevId).addEventListener('click', () => showQuestion(quizIndex - 1));
        document.getElementById(nextId).addEventListener('click', () => showQuestion(quizIndex + 1));
        questions.forEach(q => q.querySelectorAll('input').forEach(input => input.addEventListener('change', () => showQuestion(quizIndex))));
        document.getElementById(checkId).addEventListener('click', () => {
          let score = 0, answered = 0;
          questions.forEach(q => {
            const picked = q.querySelector('input:checked');
            if (picked) { answered++; if (picked.value === q.dataset.correct) score++; }
          });
          const result = document.getElementById(resultId);
          result.classList.add('show');
          if (answered < questions.length) {
            result.innerHTML = `ตอบแล้ว ${answered}/${questions.length} ข้อ — กรุณาตอบให้ครบก่อนตรวจคะแนน`;
            return;
          }
          if (stage === 'pre') {
            saveScore(score);
            result.innerHTML = `<strong>คะแนนก่อนเรียน ${score}/${questions.length}</strong><br>บันทึกคะแนนแล้ว เริ่มเรียนได้เลย และกลับมาเปรียบเทียบอีกครั้งหลังจบบทเรียน`;
            return;
          }
          const preScore = readScore();
          const comparison = preScore === null
            ? 'ยังไม่พบคะแนนก่อนเรียน จึงยังเปรียบเทียบพัฒนาการไม่ได้'
            : `ก่อนเรียน ${preScore}/${questions.length} → หลังเรียน ${score}/${questions.length} · ${score - preScore >= 0 ? 'เพิ่มขึ้น' : 'เปลี่ยนแปลง'} ${Math.abs(score - preScore)} คะแนน`;
          result.innerHTML = `<strong>คะแนนหลังเรียน ${score}/${questions.length}</strong><br>${comparison}<br>${score >= 4 ? 'ยอดเยี่ยม สามารถนำความรู้ไปใช้กับชุดข้อมูลจริงได้' : 'ควรทบทวนประเภทข้อมูล สูตรพื้นฐาน และการเลือกแผนภูมิอีกครั้ง'}`;
        });
        showQuestion(0);
      }

      setupQuiz({ questionSelector: '.pre-question', navId: 'preQuizNav', prevId: 'preQuizPrev', nextId: 'preQuizNext', checkId: 'preQuizCheck', resultId: 'preQuizResult', stage: 'pre' });
      setupQuiz({ questionSelector: '.question', navId: 'quizNav', prevId: 'quizPrev', nextId: 'quizNext', checkId: 'quizCheck', resultId: 'quizResult', stage: 'post' });
      go(initialSlide, false);
    })();
