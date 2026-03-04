'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getDailyImage, getExtraImage } from '../lib/imageSchedule'
import {
  resetDailyStateIfNewDay,
  getDailyComplete, setDailyComplete,
  getExtraUnlocked,
  getExtraComplete, setExtraComplete,
} from '../lib/paintState'
import HomeScreen from '../components/HomeScreen'
import PaintingScreen from '../components/PaintingScreen'
import CompleteScreen from '../components/CompleteScreen'

const SCREEN = {
  HOME: 'HOME',
  PAINTING: 'PAINTING',
  COMPLETE: 'COMPLETE',
}

export default function Page() {
  const [screen, setScreen] = useState(SCREEN.HOME)
  const [activeImage, setActiveImage] = useState(null)
  const [activeSlot, setActiveSlot] = useState(null)  // 'daily' | 'extra'
  const [completedDataUrl, setCompletedDataUrl] = useState(null)

  // 상태 스냅샷 (HOME 렌더링용)
  const [dailyComplete, setDailyCompleteState] = useState(false)
  const [extraUnlocked, setExtraUnlockedState] = useState(false)
  const [extraComplete, setExtraCompleteState] = useState(false)

  const dailyImage = getDailyImage()
  const extraImage = getExtraImage()

  useEffect(() => {
    // 날짜 변경 감지 + 일별 리셋
    resetDailyStateIfNewDay()

    // 상태 읽기
    setDailyCompleteState(getDailyComplete())
    setExtraUnlockedState(getExtraUnlocked())
    setExtraCompleteState(getExtraComplete())
  }, [])

  function handleStartPainting(image, slot) {
    setActiveImage(image)
    setActiveSlot(slot)
    setScreen(SCREEN.PAINTING)
  }

  function handlePaintingComplete(dataUrl) {
    // 완료 상태 저장
    if (activeSlot === 'daily') {
      setDailyComplete()
      setDailyCompleteState(true)
    } else if (activeSlot === 'extra') {
      setExtraComplete()
      setExtraCompleteState(true)
    }

    setCompletedDataUrl(dataUrl)
    setScreen(SCREEN.COMPLETE)
  }

  function handleGoHome() {
    setScreen(SCREEN.HOME)
    setActiveImage(null)
    setCompletedDataUrl(null)
  }

  function handleBackToPainting() {
    setScreen(SCREEN.HOME)
    setActiveImage(null)
  }

  return (
    <div style={{ height: '100dvh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {screen === SCREEN.HOME && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <HomeScreen
              dailyImage={dailyImage}
              extraImage={extraImage}
              dailyComplete={dailyComplete}
              extraUnlocked={extraUnlocked}
              extraComplete={extraComplete}
              onStartPainting={handleStartPainting}
            />
          </motion.div>
        )}

        {screen === SCREEN.PAINTING && activeImage && (
          <motion.div
            key="painting"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <PaintingScreen
              image={activeImage}
              onComplete={handlePaintingComplete}
              onBack={handleBackToPainting}
            />
          </motion.div>
        )}

        {screen === SCREEN.COMPLETE && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CompleteScreen
              dataUrl={completedDataUrl}
              imageMeta={activeImage}
              onGoHome={handleGoHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
