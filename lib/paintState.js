import { getKSTDateString } from './imageSchedule'

const PREFIX = 'minhwa_'

function key(k) { return PREFIX + k }

/** 새 날이면 일별 상태 초기화 */
export function resetDailyStateIfNewDay() {
  const today = getKSTDateString()
  const stored = localStorage.getItem(key('dailyDate'))
  if (stored !== today) {
    localStorage.setItem(key('dailyDate'), today)
    localStorage.removeItem(key('dailyComplete'))
    localStorage.removeItem(key('extraUnlocked'))
    localStorage.removeItem(key('extraComplete'))
    updateStreak(today, stored)
  }
}

function updateStreak(today, lastDate) {
  const lastVisit = localStorage.getItem(key('lastVisitDate'))
  const streak = parseInt(localStorage.getItem(key('streakCount')) || '0')

  if (!lastVisit) {
    localStorage.setItem(key('streakCount'), '1')
  } else {
    // 어제인지 확인
    const yesterday = new Date(Date.now() + 9 * 3600 * 1000 - 86400000)
      .toISOString().split('T')[0]
    if (lastVisit === yesterday) {
      localStorage.setItem(key('streakCount'), String(streak + 1))
    } else {
      localStorage.setItem(key('streakCount'), '1')
    }
  }
  localStorage.setItem(key('lastVisitDate'), today)
}

// 일별 상태 게터/세터
export function getDailyComplete() {
  return localStorage.getItem(key('dailyComplete')) === 'true'
}
export function setDailyComplete() {
  localStorage.setItem(key('dailyComplete'), 'true')
}

export function getExtraUnlocked() {
  return localStorage.getItem(key('extraUnlocked')) === 'true'
}
export function setExtraUnlocked() {
  localStorage.setItem(key('extraUnlocked'), 'true')
}

export function getExtraComplete() {
  return localStorage.getItem(key('extraComplete')) === 'true'
}
export function setExtraComplete() {
  localStorage.setItem(key('extraComplete'), 'true')
}

export function getStreak() {
  return parseInt(localStorage.getItem(key('streakCount')) || '1')
}

// 색칠 진행 상태 저장/복원
export function savePaintProgress(imageId, base64) {
  try {
    localStorage.setItem(key('paint_' + imageId), base64)
    localStorage.setItem(key('paint_' + imageId + '_ts'), String(Date.now()))
  } catch (e) {
    // localStorage 용량 초과 시 무시
    console.warn('진행 상태 저장 실패 (용량 초과):', e)
  }
}

export function loadPaintProgress(imageId) {
  return localStorage.getItem(key('paint_' + imageId)) || null
}

export function clearPaintProgress(imageId) {
  localStorage.removeItem(key('paint_' + imageId))
  localStorage.removeItem(key('paint_' + imageId + '_ts'))
}
