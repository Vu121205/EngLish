/**
 * Class AudioService - Quản lý âm thanh & phát âm Text-To-Speech (TTS)
 * Áp dụng Web Speech API và Web Audio API (không cần tải thêm file mp3 ngoài)
 */
class AudioService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.audioCtx = null;
    this.speechRate = 0.85;
    this.lang = 'en-US';
  }

  /**
   * Khởi tạo Web Audio Context khi cần (tránh autoplay policy cảnh báo)
   */
  _getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Phát âm từ hoặc câu tiếng Anh
   * @param {string} text - Nội dung cần đọc
   * @param {number} [rate] - Tốc độ đọc (mặc định 0.85)
   */
  speak(text, rate = null) {
    if (!this.synth || !text) return;

    try {
      this.synth.cancel(); // Dừng phát âm trước đó
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.lang;
      utterance.rate = rate !== null ? rate : this.speechRate;

      // Ưu tiên chọn giọng tiếng Anh tự nhiên nếu có
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Lỗi SpeechSynthesis:', err);
    }
  }

  /**
   * Dừng phát âm
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Phát âm thanh chúc mừng / trả lời đúng (Ding-dong hợp âm vui nhộn)
   */
  playSuccessSound() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Nốt 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch (e) {
      // Bỏ qua nếu bị giới hạn
    }
  }

  /**
   * Phát âm thanh trả lời sai (Boop nhẹ nhàng)
   */
  playErrorSound() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.25); // D3
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Bỏ qua nếu bị giới hạn
    }
  }

  /**
   * Kiểm tra thiết bị có hỗ trợ Text-to-Speech không
   * @returns {boolean}
   */
  isSupported() {
    return Boolean(window.speechSynthesis);
  }
}
