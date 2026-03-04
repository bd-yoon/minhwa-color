// 민화 이미지 목록 — 파일을 추가할 때 여기에도 추가
export const IMAGES = [
  {
    id: 'kkachi_horangi',
    title: '까치호랑이',
    subtitle: '민화',
    file: '/images/까치호랑이.jpg',
    thumbnail: '/images/까치호랑이.jpg',
    aspect: '2704/3909',  // 세로형
  },
  {
    id: 'chaekgado',
    title: '책가도',
    subtitle: '민화',
    file: '/images/책가도.jpg',
    thumbnail: '/images/책가도.jpg',
    aspect: '2502/3936',  // 세로형
  },
  {
    id: 'hwajeobdo',
    title: '화접도',
    subtitle: '민화',
    file: '/images/화접도.jpg',
    thumbnail: '/images/화접도.jpg',
    aspect: '3234/2406',  // 가로형
  },
  {
    id: 'hwajodo',
    title: '화조도',
    subtitle: '민화',
    file: '/images/화조도.jpg',
    thumbnail: '/images/화조도.jpg',
    aspect: '3450/2154',  // 가로형
  },
]

/** KST 기준 오늘 날짜 문자열 'YYYY-MM-DD' */
export function getKSTDateString() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().split('T')[0]
}

/** KST 기준 연도 내 날짜 인덱스 (0~364) */
function getDayOfYear() {
  const now = Date.now() + 9 * 3600 * 1000
  const kstDate = new Date(now)
  const y = kstDate.getUTCFullYear()
  const start = Date.UTC(y, 0, 1)
  return Math.floor((now - start) / 86400000)
}

/** 오늘의 이미지 인덱스 */
function getDailyIndex() {
  return getDayOfYear() % IMAGES.length
}

/** 오늘의 메인 이미지 */
export function getDailyImage() {
  return IMAGES[getDailyIndex()]
}

/** 광고 시청 후 추가 이미지 (다음 인덱스) */
export function getExtraImage() {
  return IMAGES[(getDailyIndex() + 1) % IMAGES.length]
}
