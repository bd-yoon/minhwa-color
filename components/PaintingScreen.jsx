'use client'

import { useState, useRef, useCallback } from 'react'
import { BRUSH_TYPES } from '../lib/colors'
import PaintingCanvas from './PaintingCanvas'
import ToolBar from './ToolBar'
import ColorPalette from './ColorPalette'
import BrushSelector from './BrushSelector'

const BOTTOM_PANEL_HEIGHT = 148  // 색상 + 붓 패널

export default function PaintingScreen({ image, onComplete, onBack }) {
  const engineRef = useRef(null)

  const [color, setColor] = useState('#C0392B')
  const [brush, setBrush] = useState({
    type: 'round',
    size: BRUSH_TYPES[0].defaultSize,
    opacity: 1.0,
  })
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [canComplete, setCanComplete] = useState(false)

  const handleEngineReady = useCallback((engine) => {
    engineRef.current = engine
    engine.setColor(color)
    engine.setBrush(brush)
  }, [])

  const handleColorChange = useCallback((hex) => {
    setColor(hex)
    engineRef.current?.setColor(hex)
  }, [])

  const handleBrushChange = useCallback((newBrush) => {
    setBrush(newBrush)
    engineRef.current?.setBrush(newBrush)
  }, [])

  const handleUndo = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.undo()
    setCanUndo(engine.canUndo())
    setCanRedo(engine.canRedo())
    setCanComplete(engine.hasSufficientCoverage())
  }, [])

  const handleRedo = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.redo()
    setCanUndo(engine.canUndo())
    setCanRedo(engine.canRedo())
    setCanComplete(engine.hasSufficientCoverage())
  }, [])

  const handleCoverageChange = useCallback((hasCoverage) => {
    setCanComplete(hasCoverage)
  }, [])

  // stroke가 끝날 때마다 undo/redo/complete 상태 업데이트
  // PaintingCanvas에서 engine의 endStroke를 wrap해서 콜백 주입
  const handleCanvasReady = useCallback((engine) => {
    handleEngineReady(engine)

    // endStroke 후 상태 업데이트를 위해 원본 메서드 wrap
    const origEnd = engine.endStroke.bind(engine)
    engine.endStroke = function() {
      origEnd()
      setCanUndo(engine.canUndo())
      setCanRedo(engine.canRedo())
      setCanComplete(engine.hasSufficientCoverage())
    }
  }, [handleEngineReady])

  const handleComplete = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const dataUrl = engine.exportComposite()
    onComplete(dataUrl)
  }, [onComplete])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        background: '#FDF8F3',
        overflow: 'hidden',
      }}
    >
      {/* 상단 툴바 */}
      <ToolBar
        onBack={onBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onComplete={handleComplete}
        canUndo={canUndo}
        canRedo={canRedo}
        canComplete={canComplete}
      />

      {/* 제목 */}
      <div
        style={{
          padding: '6px 16px 4px',
          background: 'rgba(253,248,243,0.9)',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <p style={{ fontSize: '0.72rem', color: '#8A8A9A', margin: 0 }}>
          {image.subtitle}
        </p>
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
          {image.title}
        </p>
      </div>

      {/* 캔버스 영역 */}
      <PaintingCanvas
        image={image}
        onEngineReady={handleCanvasReady}
        onCoverageChange={handleCoverageChange}
      />

      {/* 하단 팔레트 + 붓 패널 */}
      <div
        style={{
          height: BOTTOM_PANEL_HEIGHT + 'px',
          background: 'rgba(253,248,243,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <ColorPalette selectedColor={color} onColorChange={handleColorChange} />
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />
        <BrushSelector brush={brush} onBrushChange={handleBrushChange} />
      </div>
    </div>
  )
}
