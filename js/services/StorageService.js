/**
 * Class StorageService - Dịch vụ lưu trữ và đồng bộ dữ liệu
 * Lưu trữ từ vựng vào LocalStorage, hỗ trợ Import/Export JSON và thêm hàng loạt từ văn bản
 */
class StorageService {
  constructor() {
    this.STORAGE_KEY_WORDS = 'vocabmaster_words_v2';
    this.STORAGE_KEY_LEARNED = 'vocabmaster_learned_v2';
    this.listeners = [];
  }

  /**
   * Đăng ký lắng nghe sự kiện thay đổi dữ liệu từ vựng
   * @param {Function} callback
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Thông báo cho tất cả observers khi danh sách từ thay đổi
   */
  _notifyListeners(words) {
    this.listeners.forEach(cb => {
      try {
        cb(words);
      } catch (err) {
        console.error('Lỗi khi chạy Storage listener callback:', err);
      }
    });
  }

  /**
   * Tải danh sách từ vựng từ LocalStorage. Nếu chưa có, nạp dữ liệu mặc định ban đầu.
   * @returns {Word[]}
   */
  loadWords() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_WORDS);
      if (!raw) {
        return this.resetToDefault();
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return this.resetToDefault();
      }
      return parsed.map(item => Word.fromJSON(item));
    } catch (err) {
      console.warn('Lỗi đọc dữ liệu từ LocalStorage, khôi phục mặc định:', err);
      return this.resetToDefault();
    }
  }

  /**
   * Lưu toàn bộ danh sách từ vào LocalStorage
   * @param {Word[]} words
   */
  saveWords(words) {
    try {
      const data = words.map(w => (w instanceof Word ? w.toJSON() : w));
      localStorage.setItem(this.STORAGE_KEY_WORDS, JSON.stringify(data));
      this._notifyListeners(this.loadWords());
      return true;
    } catch (err) {
      console.error('Lỗi khi lưu từ vựng vào LocalStorage:', err);
      return false;
    }
  }

  /**
   * Thêm 1 từ vựng mới
   * @param {Object|Word} wordData
   * @returns {{success: boolean, word?: Word, errors?: string[]}}
   */
  addWord(wordData) {
    const word = wordData instanceof Word ? wordData : new Word(wordData);
    const validation = word.validate();
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const words = this.loadWords();
    // Đưa từ mới lên đầu danh sách để người dùng dễ theo dõi
    words.unshift(word);
    this.saveWords(words);
    return { success: true, word };
  }

  /**
   * Cập nhật thông tin từ vựng theo ID
   * @param {string} id
   * @param {Object} updatedFields
   * @returns {{success: boolean, word?: Word, errors?: string[]}}
   */
  updateWord(id, updatedFields) {
    const words = this.loadWords();
    const index = words.findIndex(w => w.id === id);
    if (index === -1) {
      return { success: false, errors: ['Không tìm thấy từ cần cập nhật.'] };
    }

    const current = words[index];
    const updated = new Word({
      ...current.toJSON(),
      ...updatedFields,
      id: current.id // Bảo đảm giữ nguyên ID
    });

    const validation = updated.validate();
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    words[index] = updated;
    this.saveWords(words);
    return { success: true, word: updated };
  }

  /**
   * Xóa một từ vựng
   * @param {string} id
   * @returns {boolean}
   */
  deleteWord(id) {
    const words = this.loadWords();
    const filtered = words.filter(w => w.id !== id);
    if (filtered.length === words.length) return false;

    this.saveWords(filtered);
    return true;
  }

  /**
   * Lấy chi tiết một từ theo ID
   * @param {string} id
   * @returns {Word|null}
   */
  getWordById(id) {
    const words = this.loadWords();
    return words.find(w => w.id === id) || null;
  }

  /**
   * Khôi phục lại danh sách 21 từ mặc định
   * @returns {Word[]}
   */
  resetToDefault() {
    const defaultList = (typeof DEFAULT_VOCAB_DATA !== 'undefined' ? DEFAULT_VOCAB_DATA : []).map(item => new Word(item));
    localStorage.setItem(this.STORAGE_KEY_WORDS, JSON.stringify(defaultList.map(w => w.toJSON())));
    this._notifyListeners(defaultList);
    return defaultList;
  }

  /**
   * Xuất danh sách từ vựng thành chuỗi JSON đẹp mắt
   * @returns {string}
   */
  exportToJSON() {
    const words = this.loadWords();
    return JSON.stringify(words.map(w => w.toJSON()), null, 2);
  }

  /**
   * Nhập từ vựng từ tệp hoặc chuỗi JSON
   * @param {string} jsonString
   * @param {'merge'|'replace'} [mode='merge']
   * @returns {{success: boolean, count: number, error?: string}}
   */
  importFromJSON(jsonString, mode = 'merge') {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Dữ liệu JSON phải là một mảng các từ vựng.' };
      }

      const validWords = [];
      for (const item of parsed) {
        if (item && item.word && item.meaning) {
          validWords.push(new Word(item));
        }
      }

      if (validWords.length === 0) {
        return { success: false, count: 0, error: 'Không tìm thấy từ vựng hợp lệ nào trong file JSON.' };
      }

      let finalWords;
      if (mode === 'replace') {
        finalWords = validWords;
      } else {
        // Merge: Giữ các từ cũ, thêm từ mới (tránh trùng từ tiếng Anh)
        const currentWords = this.loadWords();
        const existingWordMap = new Map(currentWords.map(w => [w.word.toLowerCase(), w]));

        validWords.forEach(w => {
          existingWordMap.set(w.word.toLowerCase(), w);
        });
        finalWords = Array.from(existingWordMap.values());
      }

      this.saveWords(finalWords);
      return { success: true, count: validWords.length };
    } catch (err) {
      return { success: false, count: 0, error: 'Lỗi định dạng JSON: ' + err.message };
    }
  }

  /**
   * Nhập hàng loạt từ văn bản nhanh (Batch quick add)
   * Hỗ trợ các định dạng mỗi dòng:
   * 1. Word | IPA | POS | Group | Meaning | Example | ExampleVi
   * 2. Word | Meaning
   * 3. Word : Meaning
   * 4. Word - Meaning
   * @param {string} text
   * @param {string} [defaultGroup='Tự thêm']
   * @returns {{success: boolean, addedCount: number, errors: string[]}}
   */
  batchImportText(text, defaultGroup = 'Tự thêm') {
    if (!text || !text.trim()) {
      return { success: false, addedCount: 0, errors: ['Nội dung nhập đang trống.'] };
    }

    const lines = text.split('\n');
    const newWords = [];
    const errors = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // Bỏ qua dòng trống hoặc chú thích

      let word = '', ipa = '', pos = '', group = defaultGroup, meaning = '', example = '', exampleVi = '';

      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          word = parts[0];
          if (parts.length === 2) {
            meaning = parts[1];
          } else {
            ipa = parts[1] || '';
            pos = parts[2] || '';
            group = parts[3] || defaultGroup;
            meaning = parts[4] || '';
            example = parts[5] || '';
            exampleVi = parts[6] || '';
          }
        }
      } else if (trimmed.includes(':')) {
        const parts = trimmed.split(':').map(p => p.trim());
        word = parts[0];
        meaning = parts.slice(1).join(':').trim();
      } else if (trimmed.includes(' - ')) {
        const parts = trimmed.split(' - ').map(p => p.trim());
        word = parts[0];
        meaning = parts.slice(1).join(' - ').trim();
      }

      if (word && meaning) {
        newWords.push(new Word({
          word,
          ipa,
          pos,
          group: group || defaultGroup,
          meaning,
          example,
          exampleVi
        }));
      } else {
        errors.push(`Dòng ${idx + 1}: Không đúng định dạng (cần từ và nghĩa).`);
      }
    });

    if (newWords.length === 0) {
      return { success: false, addedCount: 0, errors: errors.length ? errors : ['Không tìm thấy từ hợp lệ nào.'] };
    }

    const currentWords = this.loadWords();
    // Đưa các từ mới thêm lên đầu
    const combined = [...newWords, ...currentWords];
    this.saveWords(combined);

    return {
      success: true,
      addedCount: newWords.length,
      errors
    };
  }

  // --- Quản lý tiến trình học (Learned Words) ---

  /**
   * Lấy tập hợp các ID từ đã xem/học
   * @returns {Set<string>}
   */
  getLearnedWordIds() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_LEARNED);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  /**
   * Đánh dấu 1 từ đã học
   * @param {string} id
   */
  markWordLearned(id) {
    const set = this.getLearnedWordIds();
    set.add(id);
    localStorage.setItem(this.STORAGE_KEY_LEARNED, JSON.stringify(Array.from(set)));
  }

  /**
   * Xóa tiến trình đã học
   */
  resetProgress() {
    localStorage.removeItem(this.STORAGE_KEY_LEARNED);
  }
}
