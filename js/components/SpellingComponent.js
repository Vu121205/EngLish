/**
 * Class SpellingComponent - Điều khiển chế độ Luyện Nghe & Gõ Chính Tả
 * Giúp người dùng rèn luyện phản xạ nghe và ghi nhớ chính xác mặt chữ tiếng Anh
 */
class SpellingComponent {
  /**
   * @param {Object} options
   * @param {StorageService} options.storageService
   * @param {AudioService} options.audioService
   */
  constructor({ storageService, audioService }) {
    this.storage = storageService;
    this.audio = audioService;

    this.currentWord = null;
    this.hintIndex = 0;

    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.container = document.getElementById('section-spelling');
    this.btnAudioEl = document.getElementById('spell-btn-audio');
    this.meaningEl = document.getElementById('spell-meaning');
    this.ipaEl = document.getElementById('spell-ipa');
    this.inputEl = document.getElementById('spell-input');
    this.resultEl = document.getElementById('spell-result');
    this.formEl = document.getElementById('spell-form');
    this.btnHint = document.getElementById('spell-btn-hint');
    this.btnSkip = document.getElementById('spell-btn-skip');
  }

  _bindEvents() {
    if (this.btnAudioEl) {
      this.btnAudioEl.addEventListener('click', () => this.playAudio());
    }

    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.checkAnswer();
      });
    }

    if (this.btnHint) {
      this.btnHint.addEventListener('click', () => this.revealHint());
    }

    if (this.btnSkip) {
      this.btnSkip.addEventListener('click', () => this.nextWord());
    }
  }

  /**
   * Bắt đầu hoặc tải một từ mới để gõ
   */
  nextWord() {
    const words = this.storage.loadWords();
    if (words.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.hintIndex = 0;
    // Lấy ngẫu nhiên 1 từ
    this.currentWord = words[Math.floor(Math.random() * words.length)];

    if (this.meaningEl) this.meaningEl.innerText = this.currentWord.meaning;
    if (this.ipaEl) this.ipaEl.innerText = this.currentWord.pos ? `(${this.currentWord.pos})` : '';
    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.focus();
    }
    if (this.resultEl) this.resultEl.innerText = '';

    // Tự động phát âm khi hiện từ mới để luyện nghe
    setTimeout(() => {
      this.playAudio();
    }, 200);
  }

  playAudio() {
    if (this.currentWord) {
      this.audio.speak(this.currentWord.word);
    }
  }

  /**
   * Kiểm tra câu trả lời người dùng nhập
   */
  checkAnswer() {
    if (!this.currentWord || !this.inputEl) return;

    const userInput = this.inputEl.value.trim().toLowerCase();
    const targetWord = this.currentWord.word.toLowerCase();

    if (userInput === targetWord) {
      if (this.resultEl) {
        this.resultEl.className = "mt-3 text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-bounce";
        this.resultEl.innerHTML = `<span>✨ Xuất sắc! Bạn đã gõ đúng 100%!</span>`;
      }
      this.audio.playSuccessSound();

      setTimeout(() => {
        this.nextWord();
      }, 1200);
    } else {
      if (this.resultEl) {
        this.resultEl.className = "mt-3 text-sm font-semibold text-rose-600";
        this.resultEl.innerText = "❌ Chưa đúng chính tả, thử nghe lại hoặc dùng gợi ý nhé!";
      }
      this.audio.playErrorSound();
      this.inputEl.focus();
    }
  }

  /**
   * Hiển thị gợi ý dần từng ký tự
   */
  revealHint() {
    if (!this.currentWord || !this.resultEl) return;

    const target = this.currentWord.word;
    this.hintIndex++;
    const revealedLength = Math.min(this.hintIndex, target.length - 1);
    const visiblePart = target.substring(0, revealedLength);
    const masked = visiblePart + '_ '.repeat(target.length - revealedLength).trim();

    this.resultEl.className = "mt-3 text-sm font-mono font-bold text-amber-600";
    this.resultEl.innerText = `💡 Gợi ý: ${masked} (${target.length} chữ cái)`;
    if (this.inputEl) this.inputEl.focus();
  }

  renderEmptyState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg text-center max-w-xl mx-auto">
          <div class="text-4xl mb-2">✍️</div>
          <h3 class="text-lg font-bold text-slate-700">Chưa có từ vựng nào</h3>
          <p class="text-sm text-slate-500 mt-1">Vui lòng thêm từ vựng để bắt đầu luyện gõ chính tả.</p>
        </div>
      `;
    }
  }
}
