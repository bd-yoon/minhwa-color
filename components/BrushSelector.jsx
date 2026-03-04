'use client'

import { BRUSH_TYPES } from '../lib/colors'

export default function BrushSelector({ brush, onBrushChange }) {
  const currentBrushDef = BRUSH_TYPES.find(b => b.id === brush.type) || BRUSH_TYPES[0]
  const showSizeSlider = brush.type !== 'fill'

  return (
    <div className="flex flex-col gap-2 px-3 pb-2">
      {/* 붓 종류 탭 */}
      <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {BRUSH_TYPES.map((b) => (
          <button
            key={b.id}
            className={`brush-tab flex-shrink-0 ${brush.type === b.id ? 'active' : ''}`}
            onClick={() => onBrushChange({
              type: b.id,
              size: b.defaultSize || brush.size,
              opacity: 1.0,
            })}
          >
            <span className="brush-icon">{b.icon}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* 크기 슬라이더 */}
      {showSizeSlider && (
        <div className="flex items-center gap-3 px-1">
          <span style={{ fontSize: '0.6rem', color: '#8A8A9A', fontWeight: 700 }}>크기</span>
          <input
            type="range"
            min={currentBrushDef.minSize}
            max={currentBrushDef.maxSize}
            value={brush.size}
            onChange={(e) => onBrushChange({ ...brush, size: parseInt(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{
            fontSize: '0.72rem',
            color: '#C0392B',
            fontWeight: 700,
            minWidth: '28px',
            textAlign: 'right',
          }}>
            {brush.size}
          </span>
        </div>
      )}
    </div>
  )
}
