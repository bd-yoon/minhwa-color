import { getKSTDateString } from './imageSchedule'

const PREFIX = 'minhwa_'

function key(k) { return PREFIX + k }

// SSR 환경에서 localStorage 접근 방지
function ls() {
  return typeof window !== 'undefined' ? window.localStorage : null
}

/** 새 날이면 일별 상태 초기화 */
export function resetDailyStateIfNewDay() {
  const store = ls()
  if (!store) return

  const today = getKSTDateString()
  const stored = store.getItem(key('dailyDate'))
  if (stored !== today) {
    store.setItem(key('dailyDate'), today)
    store.removeItem(key('dailyComplete'))
    store.removeItem(key('extraUnlocked'))
    store.removeItem(key('extraComplete'))
    updateStreak(store, today)
  }
}

function updateStreak(store, today) {
  const lastVisit = store.getItem(key('lastVisitDate'))
  const streak = parseInt(store.getItem(key('streakCount')) || '0')

  if (!lastVisit) {
    store.setItem(key('streakCount'), '1')
  } else {
    const yesterday = new Date(Date.now() + 9 * 3600 * 1000 - 86400000)
      .toISOString().split('T')[0]
    if (lastVisit === yesterday) {
      store.setItem(key('streakCount'), String(streak + 1))
    } else {
      store.setItem(key('streakCount'), '1')
    }
  }
  store.setItem(key('lastVisitDate'), today)
}

// 일별 상태 게터/세터
export function getDailyComplete() {
  return ls()?.getItem(key('dailyComplete')) === 'true'
}
export function setDailyComplete() {
  ls()?.setItem(key('dailyComplete'), 'true')
}

export function getExtraUnlocked() {
  return ls()?.getItem(key('extraUnlocked')) === 'true'
}
export function setExtraUnlocked() {
  ls()?.setItem(key('extraUnlocked'), 'true')
}

export function getExtraComplete() {
  return ls()?.getItem(key('extraComplete')) === 'true'
}
export function setExtraComplete() {
  ls()?.setItem(key('extraComplete'), 'true')
}

export function getStreak() {
  return parseInt(ls()?.getItem(key('streakCount')) || '1')
}

// 색칠 진행 상태 저장/복원
export function savePaintProgress(imageId, base64) {
  try {
    ls()?.setItem(key('paint_' + imageId), base64)
    ls()?.setItem(key('paint_' + imageId + '_ts'), String(Date.now()))
  } catch (e) {
    console.warn('진행 상태 저장 실패 (용량 초과):', e)
  }
}

export function loadPaintProgress(imageId) {
  return ls()?.getItem(key('paint_' + imageId)) || null
}

export function clearPaintProgress(imageId) {
  ls()?.removeItem(key('paint_' + imageId))
  ls()?.removeItem(key('paint_' + imageId + '_ts'))
}
