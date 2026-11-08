# 📘 VocabMaster Pro - Hệ Thống Luyện Tập & Quản Lý Từ Vựng Tiếng Anh

Ứng dụng web học và luyện tập từ vựng tiếng Anh chuyên nghiệp, được xây dựng theo **Kiến trúc Hướng đối tượng (OOP)** sạch sẽ, mô-đun hóa, hỗ trợ lật thẻ 3D Flashcards, trắc nghiệm phản xạ, luyện gõ chính tả, phát âm bản ngữ (TTS) và cho phép người dùng tùy ý thêm, sửa, xóa, nhập/xuất kho từ vựng cá nhân.

---

## 🗂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
d:\Project\EngLish\
├── index.html                  # Giao diện HTML chính (Semantic, Tailwind CSS)
├── README.md                   # Tài liệu kiến trúc & hướng dẫn tích hợp cho Agent
├── css/
│   └── style.css               # Hiệu ứng 3D flip card, thanh cuộn, animations, toast
└── js/
    ├── data/
    │   └── defaultVocab.js     # 21 từ vựng ngữ âm chuẩn ban đầu (/ɪə/, /ʊə/, /ɔɪ/, /aɪ/)
    ├── models/
    │   └── Word.js             # Lớp đối tượng mô hình từ vựng (Validation, Serialization)
    ├── services/
    │   ├── AudioService.js     # Dịch vụ Text-to-Speech (TTS) & hiệu ứng âm thanh (Web Audio API)
    │   └── StorageService.js   # Dịch vụ lưu trữ LocalStorage, Observer Pattern, Import/Export
    ├── components/
    │   ├── FlashcardComponent.js   # Điều khiển lật thẻ ghi nhớ 3D & phím tắt
    │   ├── QuizComponent.js        # Điều khiển trắc nghiệm 4 lựa chọn, tính điểm & chuỗi
    │   ├── SpellingComponent.js    # Điều khiển luyện nghe & gõ chính tả, gợi ý chữ cái
    │   ├── WordListComponent.js    # Quản lý danh sách, tìm kiếm trực tiếp, lọc nhóm động
    │   └── WordManagerComponent.js # Modal thêm từ đơn, thêm hàng loạt, nhập/xuất JSON
    └── app.js                  # Lớp App trung tâm điều phối toàn bộ hệ thống
```

---

## 🧩 Kiến Trúc Hướng Đối Tượng (OOP Architecture)

Hệ thống được thiết kế theo các nguyên tắc lập trình hướng đối tượng vững chắc:

```
┌────────────────────────────────────────────────────────┐
│                        App                             │
│       (Bộ điều phối trung tâm - Coordinator)          │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
        ┌──────▼──────┐            ┌──────▼──────┐
        │AudioService │            │StorageService│
        └──────▲──────┘            └──────▲──────┘
               │                          │
 ┌─────────────┴──────────────────────────┴─────────────┐
 │                    UI COMPONENTS                     │
 │  • FlashcardComponent     • QuizComponent            │
 │  • SpellingComponent      • WordListComponent        │
 │  • WordManagerComponent                              │
 └─────────────────────────────┬────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │    Word     │ (Data Model)
                        └─────────────┘
```

### 1. Model: `Word` (`js/models/Word.js`)
- **Trách nhiệm**: Đóng gói trạng thái và hành vi của một từ vựng đơn lẻ.
- **Thuộc tính**: `id`, `word`, `ipa`, `pos`, `group`, `meaning`, `example`, `exampleVi`, `createdAt`, `reviewCount`, `isFavorite`.
- **Phương thức**:
  - `validate()`: Kiểm tra tính hợp lệ dữ liệu trước khi lưu.
  - `matches(query)`: Kiểm tra từ có khớp với từ khóa tìm kiếm (từ, nghĩa, ipa, nhóm).
  - `toJSON()`: Tuần tự hóa để lưu vào LocalStorage/JSON.
  - `static fromJSON(data)`: Factory method khôi phục instance `Word` từ object thô.

### 2. Services:
- **`AudioService` (`js/services/AudioService.js`)**:
  - Đóng gói toàn bộ `window.speechSynthesis` (Text-to-Speech phát âm tiếng Anh chuẩn).
  - Tích hợp `Web Audio API` (Oscillator + Gain) để tạo hiệu ứng âm thanh đúng/sai mà không cần file MP3 bên ngoài.
- **`StorageService` (`js/services/StorageService.js`)**:
  - Quản lý `localStorage` (`vocabmaster_words_v2`).
  - Áp dụng **Observer Pattern** qua phương thức `onChange(callback)`: khi có bất kỳ từ nào được thêm, sửa, xóa, hoặc nhập vào, tất cả các thành phần giao diện sẽ tự động cập nhật ngay lập tức.
  - Xử lý nhập/xuất file JSON, chuyển đổi chuỗi văn bản hàng loạt sang danh sách `Word`.

### 3. Components:
- **`FlashcardComponent`**: Quản lý xoay thẻ 3D, chuyển thẻ, xáo trộn (Fisher-Yates shuffle), lọc theo nhóm, hỗ trợ phím tắt (`Space`, `ArrowLeft`, `ArrowRight`).
- **`QuizComponent`**: Tạo ngẫu nhiên câu hỏi trắc nghiệm từ kho từ hiện có, tự động co giãn số lựa chọn nếu kho từ ít, tính điểm, chuỗi (streak), thông báo kết quả.
- **`SpellingComponent`**: Rèn luyện kỹ năng nghe và chính tả với tính năng gợi ý ký tự từng bước (`hintIndex`).
- **`WordListComponent`**: Lưới hiển thị từ vựng dạng thẻ hiện đại, tìm kiếm thời gian thực, nút nghe phát âm, nút sửa và xóa trực tiếp.
- **`WordManagerComponent`**: Form thêm từ mới có nút nghe thử, chỉnh sửa từ, modal thêm nhanh dạng văn bản nhiều dòng, nhập/xuất JSON.

---

## 📋 Data Contract & Schema Cho Từ Vựng

Khi các Agent khác tạo dữ liệu từ vựng cho ứng dụng này, hãy tuân theo schema chuẩn sau:

```json
{
  "id": "vocab-01",
  "word": "Resilience",
  "ipa": "/rɪˈzɪl.jəns/",
  "pos": "n",
  "group": "IELTS",
  "meaning": "Sự kiên cường, khả năng phục hồi sau khó khăn",
  "example": "She showed great resilience during the crisis.",
  "exampleVi": "Cô ấy đã thể hiện sự kiên cường to lớn trong suốt cuộc khủng hoảng.",
  "createdAt": 1730900000000,
  "reviewCount": 0,
  "isFavorite": false
}
```

### Các trường dữ liệu:
| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Tùy chọn | Nếu bỏ trống, hệ thống tự sinh `word_timestamp_hash` |
| `word` | `string` | **Có** | Từ hoặc cụm từ tiếng Anh |
| `ipa` | `string` | Không | Phiên âm quốc tế IPA (ví dụ: `/fɪər/`) |
| `pos` | `string` | Không | Từ loại (`n`, `v`, `adj`, `adv`, `phrase`...) |
| `group` | `string` | Không | Nhóm ngữ âm (`/ɪə/`, `/aɪ/`) hoặc chủ đề (`IELTS`, `Business`, `Daily`) |
| `meaning`| `string` | **Có** | Nghĩa giải thích bằng tiếng Việt |
| `example`| `string` | Không | Câu ví dụ mẫu bằng tiếng Anh |
| `exampleVi`| `string` | Không | Bản dịch tiếng Việt của câu ví dụ |

---

## 🤖 Hướng Dẫn Dành Cho Các AI Agent Khác (Agent Reuse Guide)

Nếu bạn là một **AI Agent** (ChatGPT, Claude, Gemini, Antigravity, AutoGPT...) tiếp tục làm việc trên dự án này:

### 1. Hướng dẫn thêm từ vựng mới theo chủ đề
Bạn có thể sinh dữ liệu dưới dạng JSON hoặc định dạng văn bản Batch và hướng dẫn người dùng dán vào mục **Quản Lý Kho Từ**:

#### Định dạng Batch Text (Khuyên dùng khi giao tiếp với người dùng):
```text
Resilience | /rɪˈzɪl.jəns/ | n | IELTS | Sự kiên cường | She showed great resilience. | Cô ấy thể hiện sự kiên cường.
Overcome | /ˌoʊ.vɚˈkʌm/ | v | IELTS | Vượt qua | They overcame all obstacles. | Họ đã vượt qua mọi trở ngại.
Persistent | /pɚˈsɪs.tənt/ | adj | IELTS | Kiên trì, bền bỉ | Success requires persistent effort. | Thành công đòi hỏi nỗ lực bền bỉ.
```

Hoặc cú pháp nhanh:
```text
Vocabulary | Từ vựng
Pronunciation | Sự phát âm
Fluency | Sự lưu loát
```

### 2. Hướng dẫn tạo thêm Mini-Game / Component Mới
Để thêm một chế độ luyện tập mới (ví dụ: **Nối từ (Matching Game)** hay **Điền từ vào chỗ trống**):

1. Tạo file component mới trong `js/components/MatchingComponent.js`:
   ```javascript
   class MatchingComponent {
     constructor({ storageService, audioService }) {
       this.storage = storageService;
       this.audio = audioService;
       this._cacheDOM();
       this._bindEvents();
     }
     startNewGame() {
       const words = this.storage.loadWords();
       // Logic xáo trộn thẻ từ và thẻ nghĩa...
     }
   }
   ```
2. Thêm thẻ `<button data-tab="matching">` vào `index.html`.
3. Thêm `<section id="section-matching" class="tab-section hidden">` vào `index.html`.
4. Trong `js/app.js`: Khởi tạo `this.matchingComponent = new MatchingComponent(...)` và đăng ký vào hàm `switchTab('matching')`.
5. Nhúng file script vào `index.html`.

### 3. Hướng dẫn tích hợp Từ điển Trực tuyến (Dictionary API)
Để tự động tra cứu IPA, nghĩa và câu ví dụ khi người dùng gõ từ tiếng Anh:
- Tích hợp Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`).
- Có thể tạo một Service mới `js/services/DictionaryService.js` với phương thức `async lookup(word)`.

---

## 🚀 Cách Chạy Ứng Dụng (How to Run)

Dự án được thiết kế hoàn toàn **Standalone & Zero-Dependency**:
- Không cần cài đặt Node.js hay npm.
- **Cách 1**: Nhấp đúp chuột trực tiếp vào file `d:\Project\EngLish\index.html` trong File Explorer của Windows. Ứng dụng chạy mượt mà ngay trên mọi trình duyệt (Chrome, Edge, Firefox, Brave).
- **Cách 2**: Sử dụng VS Code Extension `Live Server` hoặc chạy máy chủ tĩnh nếu muốn:
  ```powershell
  python -m http.server 8080
  # Mở http://localhost:8080 trên trình duyệt
  ```

---

## 🌟 Tóm Tắt Tính Năng Chính
- ✅ **Flashcards 3D**: Lật thẻ trực quan, hỗ trợ phím Space / Mũi tên trái phải.
- ✅ **Phát âm TTS chuẩn**: Tích hợp sẵn Web Speech API, phát âm giọng chuẩn bản ngữ kèm điều chỉnh tốc độ tự nhiên.
- ✅ **Hiệu ứng âm thanh chân thực**: Synthesizer bằng Web Audio API chúc mừng khi làm đúng.
- ✅ **Trắc nghiệm (Quiz)**: Tự động trộn từ kho từ vựng hiện tại, tính chuỗi câu đúng (Streak) và điểm số.
- ✅ **Luyện gõ chính tả (Spelling)**: Luyện nghe và phản xạ đánh vần với tính năng gợi ý ký tự.
- ✅ **Thêm từ tùy ý**: Thêm từng từ chi tiết với nút nghe thử phát âm trước khi lưu.
- ✅ **Thêm nhanh hàng loạt (Batch Add)**: Dán danh sách hàng chục từ chỉ trong 1 giây.
- ✅ **Sao lưu & Khôi phục (JSON Export/Import)**: Không lo mất dữ liệu, dễ dàng chia sẻ bộ từ vựng cho người khác.
- ✅ **Tự động lưu trữ (Persistent Storage)**: Lưu dữ liệu trong LocalStorage của trình duyệt.
