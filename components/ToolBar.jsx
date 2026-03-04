'use client'

export default function ToolBar({ onBack, onUndo, onRedo, onComplete, canUndo, canRedo, canComplete }) {
  return (
    <div
      className="flex items-center gap-2 px-4"
      style={{
        height: '56px',
        background: 'rgba(253,248,243,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* 뒤로가기 */}
      <button className="tool-btn" onClick={onBack} aria-label="홈으로">
        ←
      </button>

      <div style={{ flex: 1 }} />

      {/* Undo */}
      <button
        className="tool-btn"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="실행 취소"
        title="실행 취소"
      >
        ↩
      </button>

      {/* Redo */}
      <button
        className="tool-btn"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="다시 실행"
        title="다시 실행"
      >
        ↪
      </button>

      {/* 완성 버튼 */}
      <button
        className="btn-primary"
        style={{ width: 'auto', padding: '10px 18px', fontSize: '0.9rem' }}
        onClick={onComplete}
        disabled={!canComplete}
      >
        완성! 🎉
      </button>
    </div>
  )
}
