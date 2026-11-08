/**
 * Class FlashcardComponent - Điều khiển tính năng thẻ ghi nhớ (Flashcard 3D)
 * Hỗ trợ lật thẻ, xáo trộn, lọc theo nhóm/chủ đề và phát âm
 */
class FlashcardComponent {
  /**
   * @param {Object} options
   * @param {StorageService} options.storageService
   * @param {AudioService} options.audioService
   * @param {Function} options.onProgressUpdate
   */
  constructor({ storageService, audioService, onProgressUpdate }) {
    this.storage = storageService;
    this.audio = audioService;
    this.onProgressUpdate = onProgressUpdate;

    this.words = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.selectedGroup = 'all';

    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.container = document.getElementById('section-flashcard');
    this.cardInner = document.getElementById('flashcard-inner');
    this.cardOuter = document.getElementById('flashcard-container');
    this.counterEl = document.getElementById('fc-counter');
    this.groupBadgeEl = document.getElementById('fc-group-front');
    this.wordEl = document.getElementById('fc-word');
    this.ipaEl = document.getElementById('fc-ipa');
    this.posEl = document.getElementById('fc-pos');
    this.wordBackEl = document.getElementById('fc-word-back');
    this.ipaBackEl = document.getElementById('fc-ipa-back');
    this.meaningEl = document.getElementById('fc-meaning');
    this.exampleEl = document.getElementById('fc-example');
    this.exampleViEl = document.getElementById('fc-example-vi');
    this.btnPrev = document.getElementById('fc-btn-prev');
    this.btnNext = document.getElementById('fc-btn-next');
    this.btnShuffle = document.getElementById('fc-btn-shuffle');
    this.btnAudio = document.getElementById('fc-btn-audio');
    this.groupSelect = document.getElementById('fc-group-filter');
  }

  _bindEvents() {
    if (this.cardOuter) {
      this.cardOuter.addEventListener('click', (e) => {
        // Tránh lật thẻ khi bấm vào nút loa
        if (e.target.closest('#fc-btn-audio')) return;
        this.flip();
      });
    }

    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prev());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.next());
    if (this.btnShuffle) this.btnShuffle.addEventListener('click', () => this.shuffle());
    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playCurrentAudio();
      });
    }

    if (this.groupSelect) {
      this.groupSelect.addEventListener('change', (e) => {
        this.selectedGroup = e.target.value;
        this.refreshWords();
      });
    }

    // Hỗ trợ phím tắt bàn phím: Space (lật), Trái/Phải (chuyển thẻ)
    window.addEventListener('keydown', (e) => {
      // Chỉ kích hoạt khi đang ở tab Flashcard và không focus vào input/textarea
      if (document.getElementById('section-flashcard')?.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.flip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      }
    });
  }

  /**
   * Cập nhật danh sách nhóm trong dropdown filter
   */
  updateGroupFilterOptions() {
    if (!this.groupSelect) return;
    const allWords = this.storage.loadWords();
    const groups = Array.from(new Set(allWords.map(w => w.group).filter(Boolean)));

    const currentValue = this.selectedGroup;
    this.groupSelect.innerHTML = `<option value="all">Tất cả nhóm (${allWords.length} từ)</option>`;
    groups.forEach(g => {
      const count = allWords.filter(w => w.group === g).length;
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = `${g} (${count})`;
      this.groupSelect.appendChild(opt);
    });

    if (groups.includes(currentValue)) {
      this.groupSelect.value = currentValue;
    } else {
      this.selectedGroup = 'all';
      this.groupSelect.value = 'all';
    }
  }

  /**
   * Tải lại danh sách từ và hiển thị thẻ hiện tại
   */
  refreshWords() {
    this.updateGroupFilterOptions();
    const allWords = this.storage.loadWords();

    if (this.selectedGroup === 'all') {
      this.words = [...allWords];
    } else {
      this.words = allWords.filter(w => w.group === this.selectedGroup);
    }

    if (this.currentIndex >= this.words.length) {
      this.currentIndex = 0;
    }

    this.render();
  }

  getCurrentWord() {
    if (!this.words || this.words.length === 0) return null;
    return this.words[this.currentIndex] || null;
  }

  flip() {
    if (!this.cardInner) return;
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) {
      this.cardInner.classList.add('rotate-y-180');
    } else {
      this.cardInner.classList.remove('rotate-y-180');
    }
  }

  next() {
    if (this.words.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    this.render();
  }

  prev() {
    if (this.words.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.words.length) % this.words.length;
    this.render();
  }

  shuffle() {
    if (this.words.length <= 1) return;
    // Fisher-Yates shuffle
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
    this.currentIndex = 0;
    this.render();
  }

  playCurrentAudio() {
    const item = this.getCurrentWord();
    if (item) {
      this.audio.speak(item.word);
    }
  }

  render() {
    // Reset lật thẻ về mặt trước
    if (this.cardInner) {
      this.cardInner.classList.remove('rotate-y-180');
      this.isFlipped = false;
    }

    const item = this.getCurrentWord();

    if (!item) {
      if (this.counterEl) this.counterEl.innerText = '0 / 0';
      if (this.wordEl) this.wordEl.innerText = 'Chưa có từ vựng';
      if (this.ipaEl) this.ipaEl.innerText = '';
      if (this.posEl) this.posEl.innerText = '';
      if (this.groupBadgeEl) this.groupBadgeEl.innerText = 'Trống';
      if (this.meaningEl) this.meaningEl.innerText = 'Vui lòng thêm từ vựng để bắt đầu học.';
      if (this.exampleEl) this.exampleEl.innerText = '';
      if (this.exampleViEl) this.exampleViEl.innerText = '';
      return;
    }

    if (this.counterEl) {
      this.counterEl.innerText = `Thẻ ${this.currentIndex + 1} / ${this.words.length}`;
    }
    if (this.groupBadgeEl) {
      this.groupBadgeEl.innerText = item.group ? `Nhóm: ${item.group}` : 'Từ vựng';
    }
    if (this.wordEl) this.wordEl.innerText = item.word;
    if (this.ipaEl) this.ipaEl.innerText = item.ipa || '';
    if (this.posEl) this.posEl.innerText = item.pos ? `(${item.pos})` : '';

    // Mặt sau
    if (this.wordBackEl) this.wordBackEl.innerText = item.word;
    if (this.ipaBackEl) this.ipaBackEl.innerText = item.ipa || '';
    if (this.meaningEl) this.meaningEl.innerText = item.meaning;
    if (this.exampleEl) this.exampleEl.innerText = item.example ? `"${item.example}"` : 'Chưa có ví dụ';
    if (this.exampleViEl) this.exampleViEl.innerText = item.exampleVi || '';

    // Đánh dấu từ đã xem
    this.storage.markWordLearned(item.id);
    if (this.onProgressUpdate) {
      this.onProgressUpdate();
    }
  }
}
