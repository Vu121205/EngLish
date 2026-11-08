/**
 * Class WordManagerComponent - Quản lý chức năng Thêm, Sửa, Xóa, Nhập/Xuất kho từ vựng
 * Đóng vai trò cầu nối cho phép người dùng tùy ý thêm bất kỳ từ ngữ nào muốn học vào hệ thống
 */
class WordManagerComponent {
  /**
   * @param {Object} options
   * @param {StorageService} options.storageService
   * @param {AudioService} options.audioService
   * @param {Function} options.showToast - Hàm hiển thị thông báo toast
   * @param {Function} options.onDataChange - Hàm callback khi dữ liệu thay đổi để reload các màn hình khác
   */
  constructor({ storageService, audioService, showToast, onDataChange }) {
    this.storage = storageService;
    this.audio = audioService;
    this.showToast = showToast;
    this.onDataChange = onDataChange;

    this.editingWordId = null;

    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.modal = document.getElementById('word-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.form = document.getElementById('word-form');
    this.inputWord = document.getElementById('form-word');
    this.inputIpa = document.getElementById('form-ipa');
    this.inputPos = document.getElementById('form-pos');
    this.inputGroup = document.getElementById('form-group');
    this.inputMeaning = document.getElementById('form-meaning');
    this.inputExample = document.getElementById('form-example');
    this.inputExampleVi = document.getElementById('form-example-vi');
    this.btnTestAudio = document.getElementById('form-btn-test-audio');
    this.btnCloseModal = document.getElementById('modal-btn-close');
    this.btnCancelModal = document.getElementById('modal-btn-cancel');

    // Batch import DOM
    this.batchModal = document.getElementById('batch-modal');
    this.batchTextarea = document.getElementById('batch-textarea');
    this.batchDefaultGroup = document.getElementById('batch-default-group');
    this.btnOpenBatch = document.getElementById('btn-open-batch-modal');
    this.btnCloseBatch = document.getElementById('batch-btn-close');
    this.btnSubmitBatch = document.getElementById('batch-btn-submit');

    // Action buttons
    this.btnAddNew = document.getElementById('btn-add-word-modal');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.fileInputImport = document.getElementById('file-import-json');
    this.btnTriggerImport = document.getElementById('btn-trigger-import');
    this.btnResetDefault = document.getElementById('btn-reset-default');
  }

  _bindEvents() {
    // Mở modal thêm từ
    if (this.btnAddNew) {
      this.btnAddNew.addEventListener('click', () => this.openAddModal());
    }

    // Đóng modal từ đơn
    if (this.btnCloseModal) this.btnCloseModal.addEventListener('click', () => this.closeModal());
    if (this.btnCancelModal) this.btnCancelModal.addEventListener('click', () => this.closeModal());

    // Nút nghe thử phát âm trong form
    if (this.btnTestAudio) {
      this.btnTestAudio.addEventListener('click', () => {
        const text = this.inputWord.value.trim();
        if (text) {
          this.audio.speak(text);
        } else {
          this.showToast('Vui lòng nhập từ tiếng Anh để nghe thử.', 'warning');
        }
      });
    }

    // Submit form thêm/sửa từ
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveWordForm();
      });
    }

    // Mở & đóng modal thêm nhanh hàng loạt (Batch)
    if (this.btnOpenBatch) {
      this.btnOpenBatch.addEventListener('click', () => this.openBatchModal());
    }
    if (this.btnCloseBatch) {
      this.btnCloseBatch.addEventListener('click', () => this.closeBatchModal());
    }
    if (this.btnSubmitBatch) {
      this.btnSubmitBatch.addEventListener('click', () => this.handleBatchSubmit());
    }

    // Xuất JSON
    if (this.btnExportJson) {
      this.btnExportJson.addEventListener('click', () => this.exportVocabularyFile());
    }

    // Kích hoạt chọn file JSON để nhập
    if (this.btnTriggerImport && this.fileInputImport) {
      this.btnTriggerImport.addEventListener('click', () => {
        this.fileInputImport.click();
      });

      this.fileInputImport.addEventListener('change', (e) => {
        this.handleFileImport(e);
      });
    }

    // Khôi phục mặc định
    if (this.btnResetDefault) {
      this.btnResetDefault.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn khôi phục danh sách về 21 từ mặc định? Các từ tùy chỉnh chưa sao lưu sẽ bị xóa.')) {
          this.storage.resetToDefault();
          this.showToast('Đã khôi phục về 21 từ vựng gốc thành công!', 'success');
          if (this.onDataChange) this.onDataChange();
        }
      });
    }
  }

  /**
   * Mở modal ở chế độ thêm mới
   */
  openAddModal() {
    this.editingWordId = null;
    if (this.modalTitle) this.modalTitle.innerText = 'Thêm Từ Vựng Mới';
    if (this.form) this.form.reset();
    if (this.modal) this.modal.classList.remove('hidden');
    if (this.inputWord) this.inputWord.focus();
  }

  /**
   * Mở modal ở chế độ chỉnh sửa từ
   * @param {Word} word
   */
  openEditModal(word) {
    if (!word) return;
    this.editingWordId = word.id;
    if (this.modalTitle) this.modalTitle.innerText = 'Chỉnh Sửa Từ Vựng';

    this.inputWord.value = word.word || '';
    this.inputIpa.value = word.ipa || '';
    this.inputPos.value = word.pos || '';
    this.inputGroup.value = word.group || '';
    this.inputMeaning.value = word.meaning || '';
    this.inputExample.value = word.example || '';
    this.inputExampleVi.value = word.exampleVi || '';

    if (this.modal) this.modal.classList.remove('hidden');
    if (this.inputMeaning) this.inputMeaning.focus();
  }

  closeModal() {
    if (this.modal) this.modal.classList.add('hidden');
    this.editingWordId = null;
  }

  /**
   * Lưu dữ liệu từ form
   */
  saveWordForm() {
    const wordData = {
      word: this.inputWord.value.trim(),
      ipa: this.inputIpa.value.trim(),
      pos: this.inputPos.value.trim(),
      group: this.inputGroup.value.trim() || 'Chung',
      meaning: this.inputMeaning.value.trim(),
      example: this.inputExample.value.trim(),
      exampleVi: this.inputExampleVi.value.trim()
    };

    if (this.editingWordId) {
      const result = this.storage.updateWord(this.editingWordId, wordData);
      if (result.success) {
        this.showToast(`Đã cập nhật từ "${result.word.word}" thành công!`, 'success');
        this.closeModal();
        if (this.onDataChange) this.onDataChange();
      } else {
        this.showToast(result.errors.join(', '), 'error');
      }
    } else {
      const result = this.storage.addWord(wordData);
      if (result.success) {
        this.showToast(`Đã thêm từ "${result.word.word}" vào kho thành công!`, 'success');
        this.closeModal();
        if (this.onDataChange) this.onDataChange();
      } else {
        this.showToast(result.errors.join(', '), 'error');
      }
    }
  }

  /**
   * Mở modal thêm hàng loạt
   */
  openBatchModal() {
    if (this.batchModal) {
      this.batchTextarea.value = '';
      this.batchModal.classList.remove('hidden');
      this.batchTextarea.focus();
    }
  }

  closeBatchModal() {
    if (this.batchModal) {
      this.batchModal.classList.add('hidden');
    }
  }

  /**
   * Xử lý thêm hàng loạt từ văn bản
   */
  handleBatchSubmit() {
    const text = this.batchTextarea.value.trim();
    const defaultGroup = this.batchDefaultGroup?.value.trim() || 'Tự thêm';

    if (!text) {
      this.showToast('Vui lòng dán danh sách từ cần thêm.', 'warning');
      return;
    }

    const result = this.storage.batchImportText(text, defaultGroup);
    if (result.success) {
      this.showToast(`Đã thêm thành công ${result.addedCount} từ mới vào kho!`, 'success');
      this.closeBatchModal();
      if (this.onDataChange) this.onDataChange();
    } else {
      this.showToast(result.errors.join('; '), 'error');
    }
  }

  /**
   * Xuất file JSON tải xuống máy tính
   */
  exportVocabularyFile() {
    const jsonStr = this.storage.exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);

    const a = document.createElement('a');
    a.href = url;
    a.download = `VocabMaster_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Đã tải xuống file sao lưu JSON thành công!', 'success');
  }

  /**
   * Xử lý đọc và nhập file JSON khi người dùng chọn file
   */
  handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const result = this.storage.importFromJSON(content, 'merge');
      if (result.success) {
        this.showToast(`Đã nhập thành công ${result.count} từ vựng từ tệp!`, 'success');
        if (this.onDataChange) this.onDataChange();
      } else {
        this.showToast('Nhập tệp thất bại: ' + result.error, 'error');
      }
      // Reset input để có thể chọn lại file cùng tên
      event.target.value = '';
    };

    reader.onerror = () => {
      this.showToast('Không thể đọc file đã chọn.', 'error');
      event.target.value = '';
    };

    reader.readAsText(file);
  }
}
