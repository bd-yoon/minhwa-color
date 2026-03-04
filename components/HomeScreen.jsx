'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showAd } from '../lib/adsInToss'
import {
  setExtraUnlocked,
  getStreak,
} from '../lib/paintState'

function ImageCard({ image, isComplete, isLocked, onTap, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`image-card ${isComplete ? 'completed' : ''}`}
      onClick={isLocked ? undefined : onTap}
      style={{ cursor: isLocked ? 'default' : 'pointer' }}
    >
      {/* 썸네일 or 플레이스홀더 */}
      <div
        style={{
          width: '100%',
          aspectRatio: image.aspect || '3/4',
          background: isComplete
            ? 'linear-gradient(135deg, #F0FFF4 0%, #E8F5E9 100%)'
            : 'linear-gradient(135deg, #FDF8F3 0%, #FAF0E6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 실제 이미지가 있으면 표시 */}
        <img
          src={image.file}
          alt={image.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isComplete ? 0.6 : 0.9,
          }}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        {/* 이미지 없을 때 fallback */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
        }}>
          🖼️
        </div>

        {/* 완성 오버레이 */}
        {isComplete && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(39,174,96,0.15)',
          }}>
            <span style={{ fontSize: '3rem' }}>✅</span>
          </div>
        )}

        {/* 잠금 오버레이 */}
        {isLocked && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: '2rem' }}>🔒</span>
          </div>
        )}
      </div>

      {/* 카드 정보 */}
      <div style={{ padding: '12px 14px' }}>
        {label && (
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#C0392B',
            letterSpacing: '0.05em',
          }}>
            {label}
          </span>
        )}
        <p style={{ fontSize: '0.72rem', color: '#8A8A9A', margin: '2px 0 0' }}>
          {image.subtitle}
        </p>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', margin: '2px 0 0' }}>
          {image.title}
        </p>
        {isComplete && (
          <span className="complete-badge" style={{ position: 'static', display: 'inline-block', marginTop: '6px' }}>
            완성 ✓
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function HomeScreen({
  dailyImage,
  extraImage,
  dailyComplete: initialDailyComplete,
  extraUnlocked: initialExtraUnlocked,
  extraComplete: initialExtraComplete,
  onStartPainting,
}) {
  const [dailyComplete] = useState(initialDailyComplete)
  const [extraUnlocked, setExtraUnlockedState] = useState(initialExtraUnlocked)
  const [extraComplete] = useState(initialExtraComplete)
  const [adLoading, setAdLoading] = useState(false)
  const [adError, setAdError] = useState(null)
  const streak = getStreak()

  const allDone = dailyComplete && extraUnlocked && extraComplete

  async function handleAdClick() {
    setAdLoading(true)
    setAdError(null)
    try {
      const watched = await showAd()
      if (watched) {
        setExtraUnlocked()
        setExtraUnlockedState(true)
      }
    } catch (e) {
      setAdError('광고를 불러올 수 없어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setAdLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100dvh',
        width: '100%',
        background: '#FDF8F3',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '52px 20px 16px',
          background: 'linear-gradient(180deg, #FDF8F3 0%, rgba(253,248,243,0) 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A2E', margin: 0 }}>
              민화 색칠하기
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#8A8A9A', margin: '2px 0 0' }}>
              오늘의 도안을 색칠해보세요
            </p>
          </div>
          {streak > 1 && (
            <span className="streak-badge">
              🔥 {streak}일 연속
            </span>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ padding: '0 20px 32px', flex: 1 }}>

        {/* 오늘의 도안 섹션 */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#8A8A9A',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            오늘의 도안
          </p>
          <ImageCard
            image={dailyImage}
            isComplete={dailyComplete}
            isLocked={false}
            onTap={() => onStartPainting(dailyImage, 'daily')}
            label="TODAY"
          />
        </div>

        {/* 광고 배너 or 추가 도안 */}
        <AnimatePresence>
          {!extraUnlocked && (
            <motion.div
              key="ad-banner"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{ marginBottom: '24px' }}
            >
              <button
                className="btn-ad"
                onClick={handleAdClick}
                disabled={adLoading}
              >
                {adLoading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    광고 로딩 중...
                  </>
                ) : (
                  <>
                    🎨 광고 보고 추가 도안 받기
                  </>
                )}
              </button>
              {adError && (
                <p style={{ fontSize: '0.75rem', color: '#E74C3C', marginTop: '8px', textAlign: 'center' }}>
                  {adError}
                </p>
              )}
            </motion.div>
          )}

          {extraUnlocked && (
            <motion.div
              key="extra-card"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ marginBottom: '24px' }}
            >
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#8A8A9A',
                letterSpacing: '0.08em',
                marginBottom: '12px',
              }}>
                추가 도안
              </p>
              <ImageCard
                image={extraImage}
                isComplete={extraComplete}
                isLocked={false}
                onTap={() => onStartPainting(extraImage, 'extra')}
                label="BONUS"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 모두 완료 메시지 */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌸</div>
            <p style={{ fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
              오늘 색칠 완료!
            </p>
            <p style={{ fontSize: '0.82rem', color: '#8A8A9A', marginTop: '4px' }}>
              내일 새로운 도안이 기다리고 있어요
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
