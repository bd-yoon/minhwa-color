// 오방색 (五方色) — 상단 고정 팔레트
export const OBANGSAEK = [
  { id: 'obang-blue',   hex: '#2B5FA5', label: '청(靑)' },
  { id: 'obang-red',    hex: '#C0392B', label: '적(赤)' },
  { id: 'obang-yellow', hex: '#D4A017', label: '황(黃)' },
  { id: 'obang-white',  hex: '#F5F5F0', label: '백(白)' },
  { id: 'obang-black',  hex: '#1A1A1A', label: '흑(黑)' },
]

// 단청 확장 팔레트 — 전통 한국 색상
export const TRADITIONAL = [
  // 붉은 계열
  '#A93226',  // 진주홍
  '#E74C3C',  // 홍색
  '#F1948A',  // 분홍
  '#FADBD8',  // 연분홍
  '#CB4335',  // 적색

  // 파란/초록 계열
  '#1A5276',  // 감청 (indigo)
  '#2471A3',  // 군청
  '#148F77',  // 청록
  '#1E8449',  // 녹색
  '#52BE80',  // 연두
  '#A9DFBF',  // 연녹

  // 황색/갈색 계열
  '#D4AC0D',  // 황색
  '#E59866',  // 황토
  '#A04000',  // 갈색
  '#6E2F1A',  // 암갈색
  '#7D6608',  // 올리브황

  // 보라 계열
  '#6C3483',  // 자주
  '#9B59B6',  // 보라
  '#D7BDE2',  // 연보라

  // 중성/살구 계열
  '#F0E6D3',  // 살구
  '#FAD7A0',  // 밝은 황
  '#F5CBA7',  // 복숭아
  '#D5DBDB',  // 은회색

  // 특수색
  '#FDFEFE',  // 흰색
  '#2C3E50',  // 먹색 (진한 남색)
  '#17202A',  // 흑청
]

// 붓 설정
export const BRUSH_TYPES = [
  {
    id: 'round',
    label: '둥근 붓',
    icon: '🖌️',
    defaultSize: 12,
    minSize: 4,
    maxSize: 40,
  },
  {
    id: 'detail',
    label: '세밀 붓',
    icon: '✏️',
    defaultSize: 4,
    minSize: 2,
    maxSize: 12,
  },
  {
    id: 'flat',
    label: '납작 붓',
    icon: '🖍️',
    defaultSize: 18,
    minSize: 8,
    maxSize: 50,
  },
  {
    id: 'watercolor',
    label: '수채화',
    icon: '💧',
    defaultSize: 16,
    minSize: 6,
    maxSize: 40,
  },
  {
    id: 'fill',
    label: '채우기',
    icon: '🪣',
    defaultSize: null,
    minSize: null,
    maxSize: null,
  },
]
