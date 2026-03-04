'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PaintingEngine } from '../lib/PaintingEngine'
import { savePaintProgress } from '../lib/paintState'

export default function PaintingCanvas({ image, onEngineReady, onCoverageChange }) {
  const containerRef = useRef(null)
  const engineRef = useRef(null)

  const handleSave = useCallback((base64) => {
    savePaintProgress(image.id, base64)
  }, [image.id])

  useEffect(() => {
    if (!containerRef.current) return

    const engine = new PaintingEngine(containerRef.current, {
      onSave: handleSave,
    })
    engineRef.current = engine

    // 선화 로드 + 저장된 진행상태 복원
    async function init() {
      await engine.loadLineArt(image.file)

      const { loadPaintProgress } = await import('../lib/paintState')
      const saved = loadPaintProgress(image.id)
      if (saved) {
        await engine.deserialize(saved)
      }

      onEngineReady(engine)

      // 초기 커버리지 체크
      onCoverageChange(engine.hasSufficientCoverage())
    }

    init()

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [image.id, image.file])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        overflow: 'hidden',
        background: '#FFFFFF',
        touchAction: 'none',
      }}
    />
  )
}
