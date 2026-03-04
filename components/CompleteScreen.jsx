'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const CONFETTI_COLORS = ['#C0392B', '#D4A017', '#2B5FA5', '#1E8449', '#9B59B6']

function spawnConfetti() {
  const count = 40
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.left = Math.random() * 100 + 'vw'
    el.style.top = '-20px'
    el.style.width = (Math.random() * 8 + 6) + 'px'
    el.style.height = (Math.random() * 8 + 6) + 'px'
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    el.style.animationDuration = (Math.random() * 2 + 2) + 's'
    el.style.animationDelay = (Math.random() * 1.5) + 's'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 5000)
  }
}

export default function CompleteScreen({ dataUrl, imageMeta, onGoHome }) {
  const hasSpawned = useRef(false)

  useEffect(() => {
    if (!hasSpawned.current) {
      hasSpawned.current = true
      spawnConfetti()
    }
  }, [])

  function handleSave() {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${imageMeta?.id || 'minhwa'}_colored.png`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100dvh',
        width: '100%',
        background: '#FDF8F3',
        padding: '24px 20px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {/* 헤더 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1A2E', margin: 0 }}>
          색칠 완성!
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#8A8A9A', marginTop: '4px' }}>
          {imageMeta?.title || '민화'}를 완성했어요
        </p>
      </motion.div>

      {/* 완성 이미지 */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 250, damping: 20 }}
        className="glass-card"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 12px 48px rgba(192,57,43,0.2)',
        }}
      >
        {dataUrl && (
          <img
            src={dataUrl}
            alt="완성 민화"
            style={{ width: '100%', display: 'block' }}
          />
        )}
      </motion.div>

      {/* 버튼들 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <button className="btn-primary" onClick={handleSave}>
          📱 사진첩에 저장하기
        </button>
        <button
          onClick={onGoHome}
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#8A8A9A',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          홈으로 돌아가기
        </button>
      </motion.div>
    </motion.div>
  )
}
