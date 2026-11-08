/**
 * Dữ liệu 21 từ vựng và ngữ âm chuẩn ban đầu
 * Mỗi từ có đầy đủ thông tin: ID, từ, phiên âm IPA, từ loại, nhóm âm/chủ đề, nghĩa tiếng Việt, câu ví dụ và bản dịch
 */
const DEFAULT_VOCAB_DATA = [
  {
    id: "vocab-01",
    word: "Fear",
    ipa: "/fɪər/",
    pos: "n, v",
    group: "/ɪə/",
    meaning: "Sự sợ hãi, lo lắng; sợ hãi",
    example: "She overcame her fear of heights.",
    exampleVi: "Cô ấy đã vượt qua nỗi sợ độ cao của mình."
  },
  {
    id: "vocab-02",
    word: "Tear",
    ipa: "/tɪər/",
    pos: "n",
    group: "/ɪə/",
    meaning: "Giọt nước mắt (khi đọc /teər/: xé rách)",
    example: "A tear rolled down her cheek.",
    exampleVi: "Một giọt nước mắt lăn dài trên má cô ấy."
  },
  {
    id: "vocab-03",
    word: "Serious",
    ipa: "/ˈsɪə.ri.əs/",
    pos: "adj",
    group: "/ɪə/",
    meaning: "Nghiêm túc, nghiêm trọng, hệ trọng",
    example: "Pollution has become a serious problem.",
    exampleVi: "Ô nhiễm đã trở thành một vấn đề nghiêm trọng."
  },
  {
    id: "vocab-04",
    word: "Appear",
    ipa: "/əˈpɪər/",
    pos: "v",
    group: "/ɪə/",
    meaning: "Xuất hiện, dường như, lộ diện",
    example: "A rainbow suddenly appeared in the sky.",
    exampleVi: "Cầu vồng bất ngờ xuất hiện trên bầu trời."
  },
  {
    id: "vocab-05",
    word: "Tearful",
    ipa: "/ˈtɪə.fəl/",
    pos: "adj",
    group: "/ɪə/",
    meaning: "Đẫm nước mắt, khóc lóc, buồn bã",
    example: "She gave a tearful farewell at the airport.",
    exampleVi: "Cô ấy đã nói lời từ biệt đẫm nước mắt tại sân bay."
  },
  {
    id: "vocab-06",
    word: "Appearance",
    ipa: "/əˈpɪə.rəns/",
    pos: "n",
    group: "/ɪə/",
    meaning: "Vẻ bề ngoài, diện mạo; sự xuất hiện",
    example: "Don't judge people by their appearance.",
    exampleVi: "Đừng đánh giá người khác qua vẻ bề ngoài."
  },
  {
    id: "vocab-07",
    word: "Frontier",
    ipa: "/ˈfrʌn.tɪər/",
    pos: "n",
    group: "/ɪə/",
    meaning: "Biên giới, ranh giới (tri thức, công nghệ)",
    example: "Scientists are exploring the frontiers of medicine.",
    exampleVi: "Các nhà khoa học đang khám phá những ranh giới mới của y học."
  },
  {
    id: "vocab-08",
    word: "Assure",
    ipa: "/əˈʃʊər/",
    pos: "v",
    group: "/ʊə/",
    meaning: "Cam đoan, đảm bảo, làm cho an tâm",
    example: "I can assure you that everything will be fine.",
    exampleVi: "Tôi cam đoan với bạn rằng mọi chuyện sẽ ổn."
  },
  {
    id: "vocab-09",
    word: "Pour",
    ipa: "/pɔːr/",
    pos: "v",
    group: "/ʊə/",
    meaning: "Rót, đổ, trút (nước, mưa như trút nước)",
    example: "Would you like me to pour you a cup of tea?",
    exampleVi: "Bạn có muốn tôi rót cho bạn một tách trà không?"
  },
  {
    id: "vocab-10",
    word: "Tourism",
    ipa: "/ˈtʊə.rɪ.zəm/",
    pos: "n",
    group: "/ʊə/",
    meaning: "Ngành du lịch, hoạt động du lịch",
    example: "Tourism plays a vital role in our economy.",
    exampleVi: "Ngành du lịch đóng vai trò then chốt trong nền kinh tế."
  },
  {
    id: "vocab-11",
    word: "Mature",
    ipa: "/məˈtʃʊər/",
    pos: "adj, v",
    group: "/ʊə/",
    meaning: "Trưởng thành, chín chắn, thành thục",
    example: "He is very mature for his age.",
    exampleVi: "Cậu ấy rất chín chắn so với độ tuổi của mình."
  },
  {
    id: "vocab-12",
    word: "Boorish",
    ipa: "/ˈbʊə.rɪʃ/",
    pos: "adj",
    group: "/ʊə/",
    meaning: "Thô lỗ, cục cằn, thô kệch",
    example: "His boorish behavior annoyed everyone at the party.",
    exampleVi: "Hành vi thô lỗ của anh ta làm mọi người trong bữa tiệc khó chịu."
  },
  {
    id: "vocab-13",
    word: "Plural",
    ipa: "/ˈplʊə.rəl/",
    pos: "n, adj",
    group: "/ʊə/",
    meaning: "Số nhiều (trong ngữ pháp)",
    example: "The plural of 'child' is 'children'.",
    exampleVi: "Số nhiều của từ 'child' là 'children'."
  },
  {
    id: "vocab-14",
    word: "Point",
    ipa: "/pɔɪnt/",
    pos: "n, v",
    group: "/ɔɪ/",
    meaning: "Điểm, quan điểm, ý kiến; chỉ trỏ",
    example: "You make a very good point.",
    exampleVi: "Bạn vừa đưa ra một quan điểm rất xác đáng."
  },
  {
    id: "vocab-15",
    word: "Loyal",
    ipa: "/ˈlɔɪ.əl/",
    pos: "adj",
    group: "/ɔɪ/",
    meaning: "Trung thành, trung kiên",
    example: "Dogs are famous for being loyal companions.",
    exampleVi: "Chó nổi tiếng là những người bạn đồng hành trung thành."
  },
  {
    id: "vocab-16",
    word: "Royalty",
    ipa: "/ˈrɔɪ.əl.ti/",
    pos: "n",
    group: "/ɔɪ/",
    meaning: "Hoàng gia, gia đình hoàng tộc; tiền nhuận bút/bản quyền",
    example: "She was treated like royalty during her visit.",
    exampleVi: "Cô ấy được tiếp đón như một thành viên hoàng gia trong chuyến thăm."
  },
  {
    id: "vocab-17",
    word: "Appointment",
    ipa: "/əˈpɔɪnt.mənt/",
    pos: "n",
    group: "/ɔɪ/",
    meaning: "Cuộc hẹn (bác sĩ, công việc); sự bổ nhiệm",
    example: "I have an appointment with the dentist tomorrow.",
    exampleVi: "Ngày mai tôi có một cuộc hẹn với nha sĩ."
  },
  {
    id: "vocab-18",
    word: "Lie",
    ipa: "/laɪ/",
    pos: "v, n",
    group: "/aɪ/",
    meaning: "Nói dối; nằm nghỉ (quá khứ: lay/lied)",
    example: "Don't lie to me, always tell the truth.",
    exampleVi: "Đừng nói dối tôi, hãy luôn nói sự thật."
  },
  {
    id: "vocab-19",
    word: "Arise",
    ipa: "/əˈraɪz/",
    pos: "v",
    group: "/aɪ/",
    meaning: "Nảy sinh, xuất hiện, phát sinh (vấn đề)",
    example: "Unexpected problems may arise during the project.",
    exampleVi: "Những vấn đề bất ngờ có thể phát sinh trong quá trình thực hiện dự án."
  },
  {
    id: "vocab-20",
    word: "Liability",
    ipa: "/ˌlaɪ.əˈbɪl.ə.ti/",
    pos: "n",
    group: "/aɪ/",
    meaning: "Trách nhiệm pháp lý; khoản nợ; gánh nặng",
    example: "The company accepted full liability for the damage.",
    exampleVi: "Công ty đã chấp nhận hoàn toàn trách nhiệm pháp lý cho thiệt hại."
  },
  {
    id: "vocab-21",
    word: "Psychology",
    ipa: "/saɪˈkɒl.ə.dʒi/",
    pos: "n",
    group: "/aɪ/",
    meaning: "Tâm lý học, tâm lý",
    example: "She is studying educational psychology at university.",
    exampleVi: "Cô ấy đang học chuyên ngành tâm lý học giáo dục tại trường đại học."
  }
];
