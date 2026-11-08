/**
 * Class WordListComponent - Quản lý danh sách từ vựng, tìm kiếm và lọc danh mục
 * Cho phép nghe phát âm trực tiếp, chỉnh sửa hoặc xóa từng từ
 */
class WordListComponent {
  /**
   * @param {Object} options
   * @param {StorageService} options.storageService
   * @param {AudioService} options.audioService
   * @param {Function} options.onEditWord - Callback khi bấm Sửa từ
   * @param {Function} options.onDeleteWord - Callback khi bấm Xóa từ
   */
  constructor({ storageService, audioService, onEditWord, onDeleteWord }) {
    this.storage = storageService;
    this.audio = audioService;
    this.onEditWord = onEditWord;
    this.onDeleteWord = onDeleteWord;

    this.currentSearch = '';
    this.selectedGroup = 'all';

    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.container = document.getElementById('section-list');
    this.searchInput = document.getElementById('search-input');
    this.filterContainer = document.getElementById('filter-categories-container');
    this.gridContainer = document.getElementById('word-grid');
    this.countBadge = document.getElementById('list-count-badge');
  }

  _bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value;
        this.render();
      });
    }
  }

  /**
   * Cập nhật danh sách các nút lọc nhóm theo dữ liệu từ vựng hiện có
   */
  renderCategoryFilters() {
    if (!this.filterContainer) return;
    const allWords = this.storage.loadWords();
    const groups = Array.from(new Set(allWords.map(w => w.group).filter(Boolean)));

    this.filterContainer.innerHTML = '';

    // Nút Tất cả
    const allBtn = document.createElement('button');
    allBtn.className = this.selectedGroup === 'all'
      ? "category-filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs transition"
      : "category-filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
    allBtn.innerText = `Tất cả (${allWords.length})`;
    allBtn.onclick = () => {
      this.selectedGroup = 'all';
      this.renderCategoryFilters();
      this.render();
    };
    this.filterContainer.appendChild(allBtn);

    // Các nút nhóm cụ thể
    groups.forEach(group => {
      const count = allWords.filter(w => w.group === group).length;
      const btn = document.createElement('button');
      btn.className = this.selectedGroup === group
        ? "category-filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs transition"
        : "category-filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
      btn.innerText = `${group} (${count})`;
      btn.onclick = () => {
        this.selectedGroup = group;
        this.renderCategoryFilters();
        this.render();
      };
      this.filterContainer.appendChild(btn);
    });
  }

  /**
   * Render toàn bộ danh sách từ theo bộ lọc tìm kiếm & nhóm
   */
  render() {
    if (!this.gridContainer) return;
    const allWords = this.storage.loadWords();

    if (this.countBadge) {
      this.countBadge.innerText = allWords.length;
    }

    // Lọc theo nhóm và từ khóa
    const filtered = allWords.filter(item => {
      const matchGroup = this.selectedGroup === 'all' || item.group === this.selectedGroup;
      const matchQuery = item.matches(this.currentSearch);
      return matchGroup && matchQuery;
    });

    this.gridContainer.innerHTML = '';

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <div class="text-3xl mb-2">🔍</div>
          <p class="font-medium text-slate-600">Không tìm thấy từ nào phù hợp</p>
          <p class="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = "bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between group";
      
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 font-mono text-indigo-700 font-semibold border border-indigo-100">
              ${item.group || 'Chung'}
            </span>
            <div class="flex items-center gap-1">
              <button class="btn-play-audio text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition" title="Nghe phát âm">
                🔊
              </button>
              <button class="btn-edit-word text-slate-400 hover:text-indigo-600 hover:bg-slate-100 p-1.5 rounded-lg transition" title="Chỉnh sửa từ">
                ✏️
              </button>
              <button class="btn-delete-word text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition" title="Xóa từ">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="flex items-baseline gap-2 mb-1">
            <h4 class="font-extrabold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">${item.word}</h4>
            <span class="text-xs italic text-slate-400 font-mono">${item.pos ? `(${item.pos})` : ''}</span>
          </div>

          <p class="font-mono text-xs text-indigo-600 font-medium mb-2.5">${item.ipa || ''}</p>
          <p class="text-sm font-semibold text-slate-800 leading-snug">${item.meaning}</p>
        </div>

        ${item.example ? `
          <div class="mt-4 pt-3 border-t border-slate-100 text-xs">
            <p class="italic text-slate-600 font-medium">"${item.example}"</p>
            ${item.exampleVi ? `<p class="text-slate-400 mt-1">${item.exampleVi}</p>` : ''}
          </div>
        ` : ''}
      `;

      // Gắn sự kiện các nút con
      const btnAudio = card.querySelector('.btn-play-audio');
      btnAudio.addEventListener('click', () => {
        this.audio.speak(item.word);
      });

      const btnEdit = card.querySelector('.btn-edit-word');
      btnEdit.addEventListener('click', () => {
        if (this.onEditWord) this.onEditWord(item);
      });

      const btnDelete = card.querySelector('.btn-delete-word');
      btnDelete.addEventListener('click', () => {
        if (this.onDeleteWord) this.onDeleteWord(item);
      });

      this.gridContainer.appendChild(card);
    });
  }
}
