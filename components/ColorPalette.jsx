'use client'

import { OBANGSAEK, TRADITIONAL } from '../lib/colors'

export default function ColorPalette({ selectedColor, onColorChange }) {
  const customRef = { current: null }

  function handleCustomColor(e) {
    onColorChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {/* 오방색 행 */}
      <div className="flex gap-2 items-end">
        {OBANGSAEK.map((c) => (
          <div key={c.id} className="flex flex-col items-center">
            <button
              className={`color-swatch ${selectedColor === c.hex ? 'selected' : ''}`}
              style={{ background: c.hex }}
              onClick={() => onColorChange(c.hex)}
              aria-label={c.label}
            />
            <span className="obang-label">{c.label.charAt(0)}</span>
          </div>
        ))}
        <div className="w-px h-8 bg-gray-200 mx-1 self-center" />
        {/* 커스텀 색상 picker */}
        <div className="flex flex-col items-center">
          <button
            className="color-swatch flex items-center justify-center text-base"
            style={{
              background: selectedColor,
              border: '2px dashed rgba(0,0,0,0.2)',
            }}
            onClick={() => document.getElementById('customColorPicker').click()}
            aria-label="커스텀 색상"
          >
            <span style={{ fontSize: '0.75rem', filter: 'invert(1)' }}>+</span>
          </button>
          <input
            id="customColorPicker"
            type="color"
            value={selectedColor}
            onChange={handleCustomColor}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />
          <span className="obang-label">직접</span>
        </div>
      </div>

      {/* 단청 확장 팔레트 (가로 스크롤) */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {TRADITIONAL.map((hex) => (
          <button
            key={hex}
            className={`color-swatch flex-shrink-0 ${selectedColor === hex ? 'selected' : ''}`}
            style={{ background: hex }}
            onClick={() => onColorChange(hex)}
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  )
}
