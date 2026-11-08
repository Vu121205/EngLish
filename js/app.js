/**
 * Class App - Bộ điều phối trung tâm của ứng dụng VocabMaster
 * Kết nối các Service và UI Component theo kiến trúc hướng đối tượng (OOP)
 */
class App {
  constructor() {
    this.currentTab = 'flashcard';

    // 1. Khởi tạo các Services cốt lõi
    this.audioService = new AudioService();
    this.storageService = new StorageService();

    // 2. Khởi tạo các Components
    this._initComponents();

    // 3. Gắn sự kiện chuyển tab và các tương tác chung
    this._bindGlobalEvents();

    // 4. Lắng nghe thay đổi dữ liệu từ Storage để tự động cập nhật tất cả màn hình
    this.storageService.onChange(() => {
      this.handleDataRefresh();
    });

    // 5. Khởi động ứng dụng
    this.updateHeaderProgress();
    this.flashcardComponent.refreshWords();
    this.wordListComponent.renderCategoryFilters();
    this.wordListComponent.render();
  }

  _initComponents() {
    // Component Quản lý từ vựng
    this.wordManagerComponent = new WordManagerComponent({
      storageService: this.storageService,
      audioService: this.audioService,
      showToast: (msg, type) => this.showToast(msg, type),
      onDataChange: () => this.handleDataRefresh()
    });

    // Component Flashcard
    this.flashcardComponent = new FlashcardComponent({
      storageService: this.storageService,
      audioService: this.audioService,
      onProgressUpdate: () => this.updateHeaderProgress()
    });

    // Component Quiz
    this.quizComponent = new QuizComponent({
      storageService: this.storageService,
      audioService: this.audioService
    });

    // Component Luyện gõ chính tả
    this.spellingComponent = new SpellingComponent({
      storageService: this.storageService,
      audioService: this.audioService
    });

    // Component Danh sách từ vựng
    this.wordListComponent = new WordListComponent({
      storageService: this.storageService,
      audioService: this.audioService,
      onEditWord: (word) => {
        this.wordManagerComponent.openEditModal(word);
      },
      onDeleteWord: (word) => {
        if (confirm(`Bạn có chắc muốn xóa từ "${word.word}"?`)) {
          this.storageService.deleteWord(word.id);
          this.showToast(`Đã xóa từ "${word.word}".`, 'info');
          this.handleDataRefresh();
        }
      }
    });
  }

  _bindGlobalEvents() {
    // Nút chuyển tab
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });
  }

  /**
   * Chuyển đổi giữa các tab chức năng
   * @param {'flashcard'|'quiz'|'spelling'|'list'|'manage'} tabName
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // Ẩn tất cả section
    document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));

    // Đặt lại style các nút nav
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-indigo-600', 'shadow-xs');
      btn.classList.add('text-slate-600');
    });

    // Hiện section được chọn
    const activeSection = document.getElementById(`section-${tabName}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }

    const activeBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('bg-white', 'text-indigo-600', 'shadow-xs');
      activeBtn.classList.remove('text-slate-600');
    }

    // Kích hoạt logic riêng của từng tab
    if (tabName === 'flashcard') {
      this.flashcardComponent.refreshWords();
    } else if (tabName === 'quiz') {
      this.quizComponent.startQuiz();
    } else if (tabName === 'spelling') {
      this.spellingComponent.nextWord();
    } else if (tabName === 'list') {
      this.wordListComponent.renderCategoryFilters();
      this.wordListComponent.render();
    }
  }

  /**
   * Khi dữ liệu từ vựng thêm/sửa/xóa/nhập, làm mới lại trạng thái toàn bộ ứng dụng
   */
  handleDataRefresh() {
    this.updateHeaderProgress();
    this.flashcardComponent.refreshWords();
    this.wordListComponent.renderCategoryFilters();
    this.wordListComponent.render();

    // Nếu đang ở tab quiz hoặc spelling thì cũng chuẩn bị lại
    if (this.currentTab === 'spelling') {
      this.spellingComponent.nextWord();
    }
  }

  /**
   * Cập nhật số lượng từ đã xem ở thanh Header
   */
  updateHeaderProgress() {
    const totalWords = this.storageService.loadWords().length;
    const learnedCount = this.storageService.getLearnedWordIds().size;
    const progressEl = document.getElementById('header-study-progress');
    const totalCountEl = document.getElementById('header-total-count');

    if (progressEl) {
      progressEl.innerText = `Đã xem: ${Math.min(learnedCount, totalWords)} / ${totalWords}`;
    }
    if (totalCountEl) {
      totalCountEl.innerText = totalWords;
    }
  }

  /**
   * Hiển thị thông báo Toast góc trên bên phải màn hình
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} [type='info']
   */
  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
      warning: 'bg-amber-500 text-white',
      info: 'bg-slate-800 text-white'
    };
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all transform duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="font-mono text-base">${icons[type] || '•'}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Hiệu ứng hiện ra
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Tự biến mất sau 3.2 giây
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 350);
    }, 3200);
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
