/**
 * Class QuizComponent - Điều khiển bài kiểm tra trắc nghiệm từ vựng
 * Tự động tạo câu hỏi ngẫu nhiên từ kho từ vựng hiện có, chấm điểm và chuỗi trả lời đúng
 */
class QuizComponent {
  /**
   * @param {Object} options
   * @param {StorageService} options.storageService
   * @param {AudioService} options.audioService
   */
  constructor({ storageService, audioService }) {
    this.storage = storageService;
    this.audio = audioService;

    this.totalQuestions = 10;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.currentWord = null;
    this.isAnswered = false;

    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.container = document.getElementById('section-quiz');
    this.indexEl = document.getElementById('quiz-index');
    this.totalEl = document.getElementById('quiz-total');
    this.scoreEl = document.getElementById('quiz-score');
    this.streakEl = document.getElementById('quiz-streak');
    this.questionWordEl = document.getElementById('quiz-question');
    this.questionIpaEl = document.getElementById('quiz-ipa');
    this.btnAudioEl = document.getElementById('quiz-btn-audio');
    this.optionsContainer = document.getElementById('quiz-options');
    this.feedbackContainer = document.getElementById('quiz-feedback');
    this.feedbackText = document.getElementById('quiz-feedback-text');
    this.btnNext = document.getElementById('quiz-btn-next');
    this.cardBox = document.getElementById('quiz-card-box');
  }

  _bindEvents() {
    if (this.btnAudioEl) {
      this.btnAudioEl.addEventListener('click', () => {
        if (this.currentWord) {
          this.audio.speak(this.currentWord.word);
        }
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        this.nextQuestion();
      });
    }
  }

  /**
   * Bắt đầu một vòng chơi mới
   */
  startQuiz() {
    const words = this.storage.loadWords();
    if (words.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.score = 0;
    this.streak = 0;
    this.currentQuestionIndex = 0;
    this.totalQuestions = Math.min(10, Math.max(5, words.length));

    if (this.scoreEl) this.scoreEl.innerText = '0';
    if (this.streakEl) this.streakEl.innerText = '0';
    if (this.totalEl) this.totalEl.innerText = this.totalQuestions;

    if (this.cardBox) this.cardBox.classList.remove('hidden');
    this.nextQuestion();
  }

  /**
   * Hiển thị câu hỏi tiếp theo
   */
  nextQuestion() {
    const words = this.storage.loadWords();
    if (words.length === 0) {
      this.renderEmptyState();
      return;
    }

    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.showQuizResult();
      return;
    }

    this.currentQuestionIndex++;
    this.isAnswered = false;

    if (this.indexEl) this.indexEl.innerText = this.currentQuestionIndex;
    if (this.feedbackContainer) this.feedbackContainer.classList.add('hidden');

    // Chọn ngẫu nhiên một từ làm câu hỏi
    this.currentWord = words[Math.floor(Math.random() * words.length)];

    if (this.questionWordEl) this.questionWordEl.innerText = this.currentWord.word;
    if (this.questionIpaEl) this.questionIpaEl.innerText = this.currentWord.ipa || '';

    // Tạo các phương án lựa chọn (1 đúng + tối đa 3 sai)
    const otherWords = words.filter(w => w.id !== this.currentWord.id).sort(() => Math.random() - 0.5);
    const distractors = otherWords.slice(0, Math.min(3, otherWords.length));
    const choices = [this.currentWord, ...distractors].sort(() => Math.random() - 0.5);

    this.renderOptions(choices);
  }

  /**
   * Render các nút lựa chọn phương án
   * @param {Word[]} choices
   */
  renderOptions(choices) {
    if (!this.optionsContainer) return;
    this.optionsContainer.innerHTML = '';

    choices.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = "w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 font-medium text-sm sm:text-base transition-all flex items-center justify-between group shadow-xs";
      btn.innerHTML = `
        <span class="text-slate-800 group-hover:text-indigo-900 font-semibold">${opt.meaning}</span>
        <span class="text-xs text-slate-400 font-mono group-hover:text-indigo-500">${opt.pos ? `(${opt.pos})` : ''}</span>
      `;

      btn.addEventListener('click', () => {
        this.handleChoice(btn, opt);
      });

      this.optionsContainer.appendChild(btn);
    });
  }

  /**
   * Xử lý khi người dùng chọn đáp án
   * @param {HTMLButtonElement} selectedBtn
   * @param {Word} selectedWord
   */
  handleChoice(selectedBtn, selectedWord) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    // Vô hiệu hóa tất cả các nút
    const allButtons = this.optionsContainer.querySelectorAll('button');
    allButtons.forEach(b => (b.disabled = true));

    const isCorrect = selectedWord.id === this.currentWord.id;

    if (isCorrect) {
      selectedBtn.className = "w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-500 text-white font-semibold flex items-center justify-between shadow-md";
      this.score += 10;
      this.streak += 1;
      this.audio.playSuccessSound();

      if (this.feedbackText) {
        this.feedbackText.className = "text-sm font-bold text-emerald-600 flex items-center gap-1.5";
        this.feedbackText.innerHTML = `<span>🎉 Chính xác! +10 điểm</span>`;
      }
    } else {
      selectedBtn.className = "w-full text-left p-4 rounded-xl border-2 border-rose-500 bg-rose-500 text-white font-semibold flex items-center justify-between shadow-md";
      this.streak = 0;
      this.audio.playErrorSound();

      if (this.feedbackText) {
        this.feedbackText.className = "text-sm font-bold text-rose-600 flex items-center gap-1.5";
        this.feedbackText.innerHTML = `<span>❌ Chưa đúng! Đáp án đúng: "${this.currentWord.meaning}"</span>`;
      }

      // Tô xanh đáp án đúng để người dùng biết
      allButtons.forEach(b => {
        if (b.innerText.includes(this.currentWord.meaning)) {
          b.className = "w-full text-left p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between";
        }
      });
    }

    if (this.scoreEl) this.scoreEl.innerText = this.score;
    if (this.streakEl) this.streakEl.innerText = this.streak;
    if (this.feedbackContainer) this.feedbackContainer.classList.remove('hidden');
  }

  /**
   * Màn hình kết quả khi làm hết số câu hỏi
   */
  showQuizResult() {
    if (!this.container) return;
    const maxScore = this.totalQuestions * 10;
    const percentage = Math.round((this.score / maxScore) * 100);

    let trophy = '🥉';
    let message = 'Cần cố gắng thêm!';
    if (percentage >= 80) {
      trophy = '🏆';
      message = 'Tuyệt vời! Bạn nắm từ rất vững!';
    } else if (percentage >= 50) {
      trophy = '🥈';
      message = 'Khá tốt! Luyện tập thêm một chút nữa nhé!';
    }

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center max-w-xl mx-auto animate-fade-in">
        <div class="text-6xl mb-3">${trophy}</div>
        <h3 class="text-2xl font-extrabold text-slate-800">Hoàn thành bài Trắc Nghiệm!</h3>
        <p class="text-sm text-slate-500 mt-1">${message}</p>
        
        <div class="my-6 py-6 px-4 bg-gradient-to-tr from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 flex justify-around items-center">
          <div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng điểm</span>
            <div class="text-4xl font-extrabold text-indigo-700">${this.score} <span class="text-lg text-slate-400 font-normal">/ ${maxScore}</span></div>
          </div>
          <div class="h-10 w-px bg-slate-200"></div>
          <div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ đúng</span>
            <div class="text-4xl font-extrabold text-emerald-600">${percentage}%</div>
          </div>
        </div>

        <button id="btn-quiz-restart" class="px-7 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition">
          🔄 Chơi lại lần nữa
        </button>
      </div>
    `;

    const restartBtn = document.getElementById('btn-quiz-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        location.reload();
      });
    }
  }

  renderEmptyState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg text-center max-w-xl mx-auto">
          <div class="text-4xl mb-2">📂</div>
          <h3 class="text-lg font-bold text-slate-700">Chưa có từ vựng nào</h3>
          <p class="text-sm text-slate-500 mt-1">Hãy thêm từ vựng mới hoặc khôi phục dữ liệu gốc để luyện trắc nghiệm.</p>
        </div>
      `;
    }
  }
}
