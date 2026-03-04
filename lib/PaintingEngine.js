/**
 * PaintingEngine
 *
 * 4레이어 캔버스 기반 색칠 엔진
 *   Layer 0 (bgCanvas):      흰 배경 (정적)
 *   Layer 1 (paintCanvas):   사용자 붓질 (저장/복원)
 *   Layer 2 (lineArtCanvas): 선화 PNG (multiply 블렌드)
 *   Layer 3 (uiCanvas):      커서 UI (export 미포함)
 */

const MAX_HISTORY = 20
const SAVE_DEBOUNCE_MS = 2000

export class PaintingEngine {
  constructor(container, options = {}) {
    this.container = container
    this.onSave = options.onSave || null  // (base64) => void

    this.color = '#C0392B'
    this.brush = { type: 'round', size: 12, opacity: 1.0 }

    this.history = []   // ImageData 스냅샷 (undo)
    this.redoStack = [] // ImageData 스냅샷 (redo)

    this._pointerDown = false
    this._lastX = 0
    this._lastY = 0
    this._pointBuffer = []   // 스트로크 스무딩용 버퍼
    this._saveTimer = null

    this._initCanvases()
    this._bindEvents()
  }

  // ─── 초기화 ──────────────────────────────────────────────

  _initCanvases() {
    const { container } = this
    const W = container.clientWidth
    const H = container.clientHeight
    const dpr = window.devicePixelRatio || 1

    this._physW = Math.round(W * dpr)
    this._physH = Math.round(H * dpr)
    this._dpr = dpr

    const makeCanvas = (zIndex) => {
      const c = document.createElement('canvas')
      c.width = this._physW
      c.height = this._physH
      c.style.width = W + 'px'
      c.style.height = H + 'px'
      c.style.position = 'absolute'
      c.style.top = '0'
      c.style.left = '0'
      c.style.zIndex = String(zIndex)
      c.style.touchAction = 'none'
      container.appendChild(c)
      return c
    }

    this.bgCanvas      = makeCanvas(0)
    this.paintCanvas   = makeCanvas(1)
    this.lineArtCanvas = makeCanvas(2)
    this.uiCanvas      = makeCanvas(3)

    // 배경 흰색
    const bgCtx = this.bgCanvas.getContext('2d')
    bgCtx.fillStyle = '#FFFFFF'
    bgCtx.fillRect(0, 0, this._physW, this._physH)

    // 선화 캔버스: multiply 블렌드 (CSS로 설정)
    this.lineArtCanvas.style.mixBlendMode = 'multiply'
    this.lineArtCanvas.style.pointerEvents = 'none'
    this.bgCanvas.style.pointerEvents = 'none'
    this.paintCanvas.style.pointerEvents = 'none'
  }

  // ─── 선화 로드 ───────────────────────────────────────────

  async loadLineArt(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const ctx = this.lineArtCanvas.getContext('2d')
        ctx.clearRect(0, 0, this._physW, this._physH)
        ctx.drawImage(img, 0, 0, this._physW, this._physH)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  // ─── 상태 복원 ───────────────────────────────────────────

  deserialize(base64) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const ctx = this.paintCanvas.getContext('2d')
        ctx.clearRect(0, 0, this._physW, this._physH)
        ctx.drawImage(img, 0, 0, this._physW, this._physH)
        resolve()
      }
      img.src = base64
    })
  }

  serialize() {
    return this.paintCanvas.toDataURL('image/png')
  }

  // ─── 색상 / 붓 설정 ─────────────────────────────────────

  setColor(hex) {
    this.color = hex
  }

  setBrush(config) {
    this.brush = { ...this.brush, ...config }
  }

  // ─── 스트로크 ────────────────────────────────────────────

  startStroke(x, y) {
    const px = x * this._dpr
    const py = y * this._dpr

    this._pointerDown = true
    this._pointBuffer = [{ x: px, y: py }]
    this._lastX = px
    this._lastY = py

    if (this.brush.type === 'fill') {
      this._floodFill(px, py)
      return
    }

    this._pushHistory()
    const ctx = this.paintCanvas.getContext('2d')
    this._applyBrushStyle(ctx)
    ctx.beginPath()
    ctx.moveTo(px, py)

    // 점 찍기 (시작점)
    if (this.brush.type === 'watercolor') {
      this._drawWatercolorDot(ctx, px, py)
    } else {
      ctx.arc(px, py, this._getBrushRadius() / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  continueStroke(x, y) {
    if (!this._pointerDown || this.brush.type === 'fill') return

    const px = x * this._dpr
    const py = y * this._dpr

    // 스무딩 버퍼 업데이트
    this._pointBuffer.push({ x: px, y: py })
    if (this._pointBuffer.length > 4) this._pointBuffer.shift()

    const smooth = this._smoothedPoint()
    const ctx = this.paintCanvas.getContext('2d')
    this._applyBrushStyle(ctx)

    if (this.brush.type === 'flat') {
      this._drawFlatStroke(ctx, this._lastX, this._lastY, smooth.x, smooth.y)
    } else if (this.brush.type === 'watercolor') {
      this._drawWatercolorStroke(ctx, this._lastX, this._lastY, smooth.x, smooth.y)
    } else {
      ctx.beginPath()
      ctx.moveTo(this._lastX, this._lastY)
      ctx.lineTo(smooth.x, smooth.y)
      ctx.stroke()
    }

    this._lastX = smooth.x
    this._lastY = smooth.y
  }

  endStroke() {
    if (!this._pointerDown) return
    this._pointerDown = false
    this._pointBuffer = []

    const ctx = this.paintCanvas.getContext('2d')
    ctx.closePath()

    this._scheduleSave()
  }

  // ─── 붓 구현 ─────────────────────────────────────────────

  _applyBrushStyle(ctx) {
    const r = this._getBrushRadius()
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.lineWidth = r

    switch (this.brush.type) {
      case 'round':
        ctx.globalAlpha = this.brush.opacity
        ctx.shadowBlur = 2 * this._dpr
        ctx.shadowColor = this.color
        break
      case 'detail':
        ctx.globalAlpha = 0.85
        ctx.shadowBlur = 0
        break
      case 'flat':
        ctx.globalAlpha = this.brush.opacity
        ctx.shadowBlur = 0
        break
      case 'watercolor':
        ctx.globalAlpha = 0.55
        ctx.shadowBlur = 4 * this._dpr
        ctx.shadowColor = this.color
        break
      default:
        ctx.globalAlpha = this.brush.opacity
        ctx.shadowBlur = 0
    }
  }

  _getBrushRadius() {
    return (this.brush.size || 12) * this._dpr
  }

  // 납작 붓: 스트로크 방향으로 회전한 타원 사각형
  _drawFlatStroke(ctx, x0, y0, x1, y1) {
    const angle = Math.atan2(y1 - y0, x1 - x0)
    const r = this._getBrushRadius()
    const w = r
    const h = r * 0.25

    ctx.save()
    ctx.translate((x0 + x1) / 2, (y0 + y1) / 2)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.rect(-Math.hypot(x1-x0, y1-y0)/2 - w/2, -h/2, Math.hypot(x1-x0, y1-y0) + w, h)
    ctx.fill()
    ctx.restore()
  }

  // 수채화 붓: 메인 + 오프셋 패스
  _drawWatercolorStroke(ctx, x0, y0, x1, y1) {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()

    // 오프셋 패스 (번짐 효과)
    const offsets = [[-1,-1],[1,-1],[-1,1]]
    const prevAlpha = ctx.globalAlpha
    ctx.globalAlpha = 0.08
    ctx.shadowBlur = 0
    for (const [ox, oy] of offsets) {
      ctx.beginPath()
      ctx.moveTo(x0 + ox * this._dpr, y0 + oy * this._dpr)
      ctx.lineTo(x1 + ox * this._dpr, y1 + oy * this._dpr)
      ctx.stroke()
    }
    ctx.globalAlpha = prevAlpha
  }

  _drawWatercolorDot(ctx, x, y) {
    const r = this._getBrushRadius() / 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // ─── 스무딩 ──────────────────────────────────────────────

  _smoothedPoint() {
    const weights = [0.1, 0.2, 0.3, 0.4]
    const buf = this._pointBuffer
    const n = buf.length
    let sx = 0, sy = 0, sw = 0
    for (let i = 0; i < n; i++) {
      const w = weights[Math.max(0, weights.length - n + i)]
      sx += buf[i].x * w
      sy += buf[i].y * w
      sw += w
    }
    return { x: sx / sw, y: sy / sw }
  }

  // ─── Flood Fill ──────────────────────────────────────────

  _floodFill(px, py) {
    const x = Math.round(px)
    const y = Math.round(py)
    const W = this._physW
    const H = this._physH

    const paintCtx = this.paintCanvas.getContext('2d')
    const lineCtx  = this.lineArtCanvas.getContext('2d')

    // 현재 paint + bg 합성 색상 확인
    const compositeCanvas = document.createElement('canvas')
    compositeCanvas.width = W
    compositeCanvas.height = H
    const compCtx = compositeCanvas.getContext('2d')
    compCtx.fillStyle = '#FFFFFF'
    compCtx.fillRect(0, 0, W, H)
    compCtx.drawImage(this.paintCanvas, 0, 0)

    const paintData = paintCtx.getImageData(0, 0, W, H)
    const lineData  = lineCtx.getImageData(0, 0, W, H)
    const compData  = compCtx.getImageData(0, 0, W, H)

    const targetIdx = (y * W + x) * 4
    const targetR = compData.data[targetIdx]
    const targetG = compData.data[targetIdx + 1]
    const targetB = compData.data[targetIdx + 2]

    // 채울 색상 파싱
    const fill = this._hexToRgb(this.color)
    if (!fill) return

    // 이미 같은 색이면 스킵
    if (Math.abs(targetR - fill.r) < 5 &&
        Math.abs(targetG - fill.g) < 5 &&
        Math.abs(targetB - fill.b) < 5) return

    this._pushHistory()

    const TOLERANCE = 35
    const visited = new Uint8Array(W * H)
    const queue = [x + y * W]
    visited[x + y * W] = 1

    function colorMatch(i4) {
      const r = compData.data[i4]
      const g = compData.data[i4 + 1]
      const b = compData.data[i4 + 2]
      const dr = r - targetR, dg = g - targetG, db = b - targetB
      return Math.sqrt(dr*dr + dg*dg + db*db) <= TOLERANCE
    }

    function isLineArtBoundary(i4) {
      // 선화 픽셀이 어두우면 경계
      return lineData.data[i4] < 100 && lineData.data[i4 + 3] > 128
    }

    function setPaintPixel(i4) {
      paintData.data[i4]     = fill.r
      paintData.data[i4 + 1] = fill.g
      paintData.data[i4 + 2] = fill.b
      paintData.data[i4 + 3] = 255
    }

    let qi = 0
    while (qi < queue.length) {
      const idx = queue[qi++]
      const cx = idx % W
      const cy = Math.floor(idx / W)
      const i4 = idx * 4

      setPaintPixel(i4)

      // 4방향 탐색
      const neighbors = [
        cx > 0     ? idx - 1 : -1,
        cx < W - 1 ? idx + 1 : -1,
        cy > 0     ? idx - W : -1,
        cy < H - 1 ? idx + W : -1,
      ]

      for (const ni of neighbors) {
        if (ni < 0 || visited[ni]) continue
        visited[ni] = 1
        const ni4 = ni * 4
        if (!isLineArtBoundary(ni4) && colorMatch(ni4)) {
          queue.push(ni)
        }
      }
    }

    paintCtx.putImageData(paintData, 0, 0)
    this._scheduleSave()
  }

  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null
  }

  // ─── Undo / Redo ─────────────────────────────────────────

  _pushHistory() {
    const ctx = this.paintCanvas.getContext('2d')
    const snapshot = ctx.getImageData(0, 0, this._physW, this._physH)
    this.history.push(snapshot)
    if (this.history.length > MAX_HISTORY) this.history.shift()
    this.redoStack = []
  }

  undo() {
    if (this.history.length === 0) return false
    const ctx = this.paintCanvas.getContext('2d')
    // 현재 상태를 redo 스택에 저장
    this.redoStack.push(ctx.getImageData(0, 0, this._physW, this._physH))
    const prev = this.history.pop()
    ctx.putImageData(prev, 0, 0)
    this._scheduleSave()
    return true
  }

  redo() {
    if (this.redoStack.length === 0) return false
    const ctx = this.paintCanvas.getContext('2d')
    this.history.push(ctx.getImageData(0, 0, this._physW, this._physH))
    const next = this.redoStack.pop()
    ctx.putImageData(next, 0, 0)
    this._scheduleSave()
    return true
  }

  canUndo() { return this.history.length > 0 }
  canRedo() { return this.redoStack.length > 0 }

  // ─── 완성 이미지 합성 ────────────────────────────────────

  exportComposite() {
    const offscreen = document.createElement('canvas')
    offscreen.width  = this._physW
    offscreen.height = this._physH
    const ctx = offscreen.getContext('2d')

    // 1. 흰 배경
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, this._physW, this._physH)

    // 2. 채색 레이어
    ctx.drawImage(this.paintCanvas, 0, 0)

    // 3. 선화 (multiply)
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(this.lineArtCanvas, 0, 0)
    ctx.globalCompositeOperation = 'source-over'

    return offscreen.toDataURL('image/png')
  }

  // ─── 채색 커버리지 체크 ──────────────────────────────────

  hasSufficientCoverage(threshold = 0.03) {
    const ctx = this.paintCanvas.getContext('2d')
    const data = ctx.getImageData(0, 0, this._physW, this._physH).data
    let painted = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 10) painted++
    }
    return (painted / (this._physW * this._physH)) > threshold
  }

  // ─── 자동 저장 ───────────────────────────────────────────

  _scheduleSave() {
    if (!this.onSave) return
    clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      this.onSave(this.serialize())
    }, SAVE_DEBOUNCE_MS)
  }

  // ─── 이벤트 바인딩 ───────────────────────────────────────

  _bindEvents() {
    const canvas = this.uiCanvas

    // pointer 이벤트: 마우스/터치 통합
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      const { x, y } = this._getPos(e)
      this.startStroke(x, y)
    })

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault()
      if (!this._pointerDown) return
      const { x, y } = this._getPos(e)
      this.continueStroke(x, y)
    })

    canvas.addEventListener('pointerup',    (e) => { e.preventDefault(); this.endStroke() })
    canvas.addEventListener('pointerleave', (e) => { e.preventDefault(); this.endStroke() })
    canvas.addEventListener('pointercancel',(e) => { e.preventDefault(); this.endStroke() })

    // iOS에서 스크롤 방지
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false })
    canvas.addEventListener('touchmove',  (e) => e.preventDefault(), { passive: false })
  }

  _getPos(e) {
    const rect = this.uiCanvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // ─── 정리 ────────────────────────────────────────────────

  destroy() {
    clearTimeout(this._saveTimer)
    // 캔버스들을 컨테이너에서 제거
    ;[this.bgCanvas, this.paintCanvas, this.lineArtCanvas, this.uiCanvas].forEach(c => {
      if (c.parentNode) c.parentNode.removeChild(c)
    })
  }
}
