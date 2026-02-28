export interface ProductSpecs {
  modelNo: string
  material: string
  size: string
  color: string
}

export interface Product {
  id: string
  title: string
  category: string
  subCategory: string
  image: string
  gallery?: string[]
  externalUrl: string
  price?: string
  specs: ProductSpecs
  description: string
}

export interface Category {
  name: string
  subCategories: string[]
}

export const categories: Category[] = [
  {
    name: "전체",
    subCategories: []
  },
  {
    name: "가방",
    subCategories: ["토트백", "숄더백", "크로스백", "클러치"]
  },
  {
    name: "지갑",
    subCategories: ["장지갑", "반지갑", "카드지갑", "동전지갑"]
  },
  {
    name: "시계",
    subCategories: ["드레스워치", "스포츠워치", "빈티지"]
  },
  {
    name: "주얼리",
    subCategories: ["목걸이", "반지", "팔찌", "귀걸이"]
  },
  {
    name: "액세서리",
    subCategories: ["스카프", "벨트", "키링", "선글라스"]
  }
]

export const products: Product[] = [
  // 가방 - 토트백
  {
    id: "1",
    title: "클래식 레더 토트백",
    category: "가방",
    subCategory: "토트백",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/1",
    specs: {
      modelNo: "ET-TB-001",
      material: "이탈리안 풀그레인 카프스킨",
      size: "W35 x H28 x D12 cm",
      color: "코냑 브라운"
    },
    description: "ETERNA의 시그니처 토트백은 이탈리아 토스카나 지방의 전통 태너리에서 엄선된 최고급 카프스킨으로 제작됩니다. 수세기에 걸쳐 전해 내려온 베지터블 태닝 기법으로 무두질된 가죽은 시간이 지날수록 깊어지는 고유의 파티나를 형성하며, 사용자만의 특별한 에이징을 경험하실 수 있습니다. 내부는 마이크로 스웨이드 라이닝으로 섬세하게 마감되었으며, 노트북 수납이 가능한 패딩 포켓과 다양한 소지품을 정리할 수 있는 다기능 포켓이 배치되어 있습니다."
  },
  {
    id: "2",
    title: "프리미엄 캔버스 토트",
    category: "가방",
    subCategory: "토트백",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/2",
    specs: {
      modelNo: "ET-TB-002",
      material: "오가닉 코튼 캔버스 / 브라이들 레더",
      size: "W40 x H32 x D15 cm",
      color: "내추럴 / 다크 브라운"
    },
    description: "지속 가능한 럭셔리를 추구하는 ETERNA의 철학이 담긴 캔버스 토트백입니다. 환경 인증을 받은 오가닉 코튼 원단에 영국 전통 방식으로 제작된 브라이들 레더 트리밍을 더해 클래식한 우아함을 완성했습니다. 왁스 코팅된 캔버스는 생활 방수 기능을 제공하며, 손으로 직접 마감한 레더 핸들은 편안한 그립감을 선사합니다."
  },
  // 가방 - 숄더백
  {
    id: "3",
    title: "빈티지 퀼팅 숄더백",
    category: "가방",
    subCategory: "숄더백",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/3",
    specs: {
      modelNo: "ET-SB-001",
      material: "램스킨 / 24K 골드 플레이티드 하드웨어",
      size: "W25 x H16 x D7 cm",
      color: "블랙"
    },
    description: "1950년대 파리지엔 우아함에서 영감받은 퀼팅 숄더백입니다. 버터처럼 부드러운 최고급 램스킨에 장인의 손끝에서 탄생한 정교한 다이아몬드 퀼팅이 시대를 초월한 아름다움을 선사합니다. 24K 골드 플레이팅 체인 스트랩은 숄더와 크로스바디 착용이 모두 가능하며, 시간이 흘러도 변치 않는 광택을 유지합니다."
  },
  {
    id: "4",
    title: "미니멀 레더 숄더",
    category: "가방",
    subCategory: "숄더백",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/4",
    specs: {
      modelNo: "ET-SB-002",
      material: "풀그레인 카프스킨",
      size: "W28 x H20 x D8 cm",
      color: "토프 그레이"
    },
    description: "절제된 미학의 정수를 담은 미니멀 숄더백입니다. 불필요한 장식을 배제하고 가죽 본연의 아름다움과 완벽한 실루엣에 집중했습니다. 손으로 직접 다듬은 에지 페인팅과 새들 스티칭은 ETERNA 장인 정신의 증거입니다."
  },
  // 가방 - 크로스백
  {
    id: "5",
    title: "엘레강스 크로스백",
    category: "가방",
    subCategory: "크로스백",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/5",
    specs: {
      modelNo: "ET-CB-001",
      material: "사피아노 레더",
      size: "W22 x H15 x D6 cm",
      color: "버건디"
    },
    description: "일상과 특별한 날 모두를 위한 엘레강스 크로스백입니다. 스크래치에 강한 사피아노 텍스처 가죽은 세련된 외관과 실용성을 동시에 제공합니다. 조절 가능한 슬림 스트랩으로 다양한 스타일링이 가능합니다."
  },

  // 지갑 - 장지갑
  {
    id: "7",
    title: "시그니처 롱 월렛",
    category: "지갑",
    subCategory: "장지갑",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/7",
    specs: {
      modelNo: "ET-LW-001",
      material: "박스 카프 레더",
      size: "W19 x H10 x D2 cm",
      color: "블랙"
    },
    description: "ETERNA의 아이코닉한 장지갑입니다. 매끄럽고 광택 있는 박스 카프 가죽은 클래식한 품격을 더합니다. 12개의 카드 슬롯, 2개의 지폐 수납공간, 지퍼 코인 포켓으로 실용성을 극대화했습니다."
  },

  // 지갑 - 카드지갑
  {
    id: "9",
    title: "슬림 카드 케이스",
    category: "지갑",
    subCategory: "카드지갑",
    image: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/9",
    specs: {
      modelNo: "ET-CC-001",
      material: "리자드 레더",
      size: "W10 x H7 x D0.5 cm",
      color: "포레스트 그린"
    },
    description: "에센셜리스트를 위한 초슬림 카드 케이스입니다. 희귀한 리자드 가죽의 독특한 스케일 패턴이 소장 가치를 더합니다. 4개의 카드와 접은 지폐를 수납할 수 있는 미니멀한 디자인입니다."
  },
  // 시계 - 드레스워치
  {
    id: "10",
    title: "클래식 드레스 워치",
    category: "시계",
    subCategory: "드레스워치",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/10",
    specs: {
      modelNo: "ET-DW-001",
      material: "18K 화이트 골드 케이스 / 알리게이터 스트랩",
      size: "케이스 직경 40mm / 두께 8mm",
      color: "실버 다이얼"
    },
    description: "스위스 제네바의 마스터 워치메이커가 제작한 드레스 워치입니다. 수작업으로 연마된 기요셰 다이얼은 빛의 각도에 따라 은은한 파동을 연출합니다. 자체 개발한 오토매틱 무브먼트는 72시간의 파워 리저브를 제공합니다."
  },
  {
    id: "11",
    title: "골드 오토매틱",
    category: "시계",
    subCategory: "드레스워치",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/11",
    specs: {
      modelNo: "ET-DW-002",
      material: "18K 옐로우 골드",
      size: "케이스 직경 38mm / 두께 7mm",
      color: "샴페인 다이얼"
    },
    description: "시간을 초월한 엘레강스를 담은 골드 오토매틱 워치입니다. 18K 옐로우 골드 케이스와 브레이슬릿은 장인의 손길로 폴리싱과 새틴 마감이 조화롭게 어우러집니다."
  },
  // 시계 - 스포츠워치
  {
    id: "12",
    title: "다이버 크로노그래프",
    category: "시계",
    subCategory: "스포츠워치",
    image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/12",
    specs: {
      modelNo: "ET-SP-001",
      material: "티타늄 케이스 / 세라믹 베젤",
      size: "케이스 직경 44mm / 두께 14mm",
      color: "블랙 다이얼"
    },
    description: "깊은 바다의 도전을 위한 프로페셔널 다이버 워치입니다. 300M 방수와 헬륨 이스케이프 밸브를 갖추었으며, 야광 처리된 인덱스와 핸즈는 어둠 속에서도 완벽한 가독성을 제공합니다."
  },
  // 시계 - 빈티지
  {
    id: "13",
    title: "헤리티지 빈티지 피스",
    category: "시계",
    subCategory: "빈티지",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/13",
    specs: {
      modelNo: "ET-VT-001",
      material: "스테인리스 스틸 / 돔형 아크릴 글라스",
      size: "케이스 직경 36mm / 두께 10mm",
      color: "크림 다이얼"
    },
    description: "1960년대 황금기의 디자인을 현대적으로 재해석한 헤리티지 컬렉션입니다. 돔형 아크릴 글라스와 패티나 느낌의 크림 다이얼이 빈티지 무드를 완성합니다."
  },
  // 주얼리 - 목걸이
  {
    id: "14",
    title: "다이아몬드 펜던트",
    category: "주얼리",
    subCategory: "목걸이",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/14",
    specs: {
      modelNo: "ET-NL-001",
      material: "18K 화이트 골드 / VVS1 다이아몬드",
      size: "체인 길이 45cm / 펜던트 12mm",
      color: "화이트 골드"
    },
    description: "순수한 빛을 담은 솔리테어 다이아몬드 펜던트입니다. GIA 인증 1캐럿 다이아몬드가 6개의 프롱 세팅으로 고정되어 최대한의 광채를 발산합니다. 섬세한 롤로 체인은 펜던트의 아름다움을 더욱 돋보이게 합니다."
  },
  {
    id: "15",
    title: "골드 체인 네클리스",
    category: "주얼리",
    subCategory: "목걸이",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/15",
    specs: {
      modelNo: "ET-NL-002",
      material: "18K 옐로우 골드",
      size: "체인 길이 50cm / 폭 3mm",
      color: "옐로우 골드"
    },
    description: "레이어링의 정석이 될 클래식 골드 체인입니다. 이탈리아 비첸차에서 수작업으로 제작된 플랫 케이블 링크가 우아한 광택을 자아냅니다."
  },
  // 주얼리 - 반지
  {
    id: "16",
    title: "시그니처 다이아 링",
    category: "주얼리",
    subCategory: "반지",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/16",
    specs: {
      modelNo: "ET-RG-001",
      material: "플래티넘 950 / D-Flawless 다이아몬드",
      size: "밴드 폭 2.5mm",
      color: "플래티넘"
    },
    description: "영원을 약속하는 솔리테어 다이아몬드 링입니다. 최고 등급 D-Flawless 다이아몬드가 클래식한 베젤 세팅으로 안착되어 있으며, 플래티넘 밴드는 세월이 흘러도 변치 않는 광채를 유지합니다."
  },
  // 주얼리 - 팔찌
  {
    id: "17",
    title: "뱅글 브레이슬릿",
    category: "주얼리",
    subCategory: "팔찌",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/17",
    specs: {
      modelNo: "ET-BR-001",
      material: "18K 로즈 골드",
      size: "내경 62mm / 폭 6mm",
      color: "로즈 골드"
    },
    description: "손목을 우아하게 감싸는 클래식 뱅글입니다. 18K 로즈 골드의 따뜻한 톤이 모든 피부톤에 아름답게 어울립니다. 경첩식 오픈 디자인으로 착용이 간편합니다."
  },
  // 주얼리 - 귀걸이
  {
    id: "18",
    title: "드롭 다이아 이어링",
    category: "주얼리",
    subCategory: "귀걸이",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/18",
    specs: {
      modelNo: "ET-ER-001",
      material: "18K 화이트 골드 / VS 다이아몬드",
      size: "전체 길이 35mm",
      color: "화이트 골드"
    },
    description: "움직임에 따라 빛나는 드롭 이어링입니다. 파베 세팅된 다이아몬드가 눈부신 캐스케이드를 연출하며, 특별한 저녁을 위한 완벽한 선택입니다."
  },

  // 액세서리 - 벨트
  {
    id: "20",
    title: "레더 드레스 벨트",
    category: "액세서리",
    subCategory: "벨트",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/20",
    specs: {
      modelNo: "ET-BL-001",
      material: "풀그레인 카프스킨 / 팔라듐 버클",
      size: "폭 3cm / 길이 85-110cm",
      color: "블랙"
    },
    description: "수트를 완성하는 필수 아이템, 드레스 벨트입니다. 단일 가죽으로 제작된 스트랩과 클래식한 핀 버클은 포멀룩의 격을 높여줍니다."
  },
  // 액세서리 - 선글라스
  {
    id: "21",
    title: "아비에이터 선글라스",
    category: "액세서리",
    subCategory: "선글라스",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/21",
    specs: {
      modelNo: "ET-SG-001",
      material: "티타늄 프레임 / 칼 자이스 렌즈",
      size: "렌즈 58mm / 브릿지 14mm / 템플 140mm",
      color: "골드 / 그린 틴트"
    },
    description: "타임리스한 아비에이터 실루엣의 선글라스입니다. 초경량 티타늄 프레임과 독일 칼 자이스의 폴라라이즈드 렌즈가 완벽한 시야와 편안함을 제공합니다."
  },
  // 액세서리 - 키링
  {
    id: "22",
    title: "레더 키 홀더",
    category: "액세서리",
    subCategory: "키링",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=1000&fit=crop"
    ],
    externalUrl: "https://example.com/product/22",
    specs: {
      modelNo: "ET-KR-001",
      material: "박스 카프 레더 / 팔라듐 피팅",
      size: "전체 길이 12cm",
      color: "버건디"
    },
    description: "일상의 작은 사치를 더하는 레더 키 홀더입니다. 광택 있는 박스 카프 가죽에 ETERNA 로고가 블라인드 엠보싱으로 새겨져 있습니다. 분리형 링으로 키 관리가 편리합니다."
  }
]
