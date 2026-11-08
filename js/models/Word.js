/**
 * Class Word - Đối tượng mô hình đại diện cho một từ vựng
 * Đóng gói dữ liệu và các hành vi liên quan đến từng từ vựng
 */
class Word {
  /**
   * @param {Object} data - Dữ liệu khởi tạo từ
   * @param {string} [data.id] - ID duy nhất
   * @param {string} data.word - Từ vựng tiếng Anh
   * @param {string} [data.ipa] - Phiên âm IPA
   * @param {string} [data.pos] - Từ loại (n, v, adj, adv...)
   * @param {string} [data.group] - Nhóm ngữ âm hoặc chủ đề
   * @param {string} data.meaning - Nghĩa tiếng Việt
   * @param {string} [data.example] - Câu ví dụ tiếng Anh
   * @param {string} [data.exampleVi] - Bản dịch câu ví dụ
   * @param {number} [data.createdAt] - Thời gian tạo
   * @param {number} [data.reviewCount] - Số lần đã ôn tập
   * @param {boolean} [data.isFavorite] - Đánh dấu yêu thích
   */
  constructor({
    id = null,
    word = '',
    ipa = '',
    pos = '',
    group = 'General',
    meaning = '',
    example = '',
    exampleVi = '',
    createdAt = Date.now(),
    reviewCount = 0,
    isFavorite = false
  } = {}) {
    this.id = id || `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.word = (word || '').trim();
    this.ipa = (ipa || '').trim();
    this.pos = (pos || '').trim();
    this.group = (group || 'General').trim();
    this.meaning = (meaning || '').trim();
    this.example = (example || '').trim();
    this.exampleVi = (exampleVi || '').trim();
    this.createdAt = createdAt || Date.now();
    this.reviewCount = reviewCount || 0;
    this.isFavorite = Boolean(isFavorite);
  }

  /**
   * Kiểm tra tính hợp lệ của từ vựng
   * @returns {{isValid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];
    if (!this.word) {
      errors.push('Từ tiếng Anh không được để trống.');
    }
    if (!this.meaning) {
      errors.push('Nghĩa tiếng Việt không được để trống.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Kiểm tra từ có khớp với chuỗi tìm kiếm không
   * @param {string} query
   * @returns {boolean}
   */
  matches(query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      this.word.toLowerCase().includes(q) ||
      this.meaning.toLowerCase().includes(q) ||
      this.ipa.toLowerCase().includes(q) ||
      this.group.toLowerCase().includes(q)
    );
  }

  /**
   * Tăng biến đếm số lần luyện tập
   */
  incrementReviewCount() {
    this.reviewCount++;
  }

  /**
   * Chuyển đổi thành Object thông thường để lưu LocalStorage hoặc JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      word: this.word,
      ipa: this.ipa,
      pos: this.pos,
      group: this.group,
      meaning: this.meaning,
      example: this.example,
      exampleVi: this.exampleVi,
      createdAt: this.createdAt,
      reviewCount: this.reviewCount,
      isFavorite: this.isFavorite
    };
  }

  /**
   * Khởi tạo đối tượng Word từ JSON hoặc Object thuần
   * @param {Object} obj
   * @returns {Word}
   */
  static fromJSON(obj) {
    if (!obj) return null;
    return new Word(obj);
  }

  /**
   * Tạo bản sao độc lập của từ
   * @returns {Word}
   */
  clone() {
    return new Word(this.toJSON());
  }
}
