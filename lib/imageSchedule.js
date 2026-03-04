// 민화 이미지 목록 — 파일을 추가할 때 여기에도 추가
export const IMAGES = [
  {
    id: 'ilwol_obongdo',
    title: '일월오봉도',
    subtitle: '궁중장식화',
    file: '/images/일월오봉도.png',
    thumbnail: '/images/일월오봉도.png',
    aspect: '680/321',  // 실제 이미지 비율 (가로형)
  },
  // 이미지를 추가할 때 여기에 항목을 추가하세요
  // {
  //   id: 'minhwa_02',
  //   title: '모란꽃',
  //   subtitle: '화조도',
  //   file: '/images/모란꽃.png',
  //   thumbnail: '/images/모란꽃.png',
  //   aspect: '3/4',
  // },
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
