# 민화 색칠하기 — 개발 로그

> **이 문서의 목적**: 민화 색칠하기 개발 전 과정 기록.
> 앱인토스 공통 사항은 `소원성취 향초 켜기/DEVLOG.md`를 함께 참조.
> 다음 프로젝트 시작 시 이 파일을 Claude에게 전달하면 컨텍스트 없이 바로 작업 재개 가능.

---

## 목차

1. [프로젝트 정보](#1-프로젝트-정보)
2. [기술 스택 & 파일 구조](#2-기술-스택--파일-구조)
3. [캔버스 아키텍처 — 4레이어 구조](#3-캔버스-아키텍처--4레이어-구조)
4. [붓 종류 & 색칠 엔진](#4-붓-종류--색칠-엔진)
5. [이미지 변환 도구 (tools/convert-lineart.html)](#5-이미지-변환-도구-toolsconvert-linearthtml)
6. [일별 이미지 시스템 & localStorage](#6-일별-이미지-시스템--localstorage)
7. [배포 파이프라인 (Vercel)](#7-배포-파이프라인-vercel)
8. [⚠️ 이번 개발에서 겪은 어려움 — 원인 분석 & 재발 방지책](#8-️-이번-개발에서-겪은-어려움--원인-분석--재발-방지책)
9. [앱인토스 전환 (미완료)](#9-앱인토스-전환-미완료)
10. [다음 민화 이미지 추가 방법](#10-다음-민화-이미지-추가-방법)

---

## 1. 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | 민화 색칠하기 |
| **GitHub** | `bd-yoon/minhwa-color` |
| **Vercel** | https://minhwa-color.vercel.app |
| **로컬 경로** | `~/Desktop/바이브코딩/민화-색칠하기/` |
| **배포 단계** | Vercel QA → (이후) Apps-in-Toss 전환 |

### 서비스 한 줄 요약
매일 하루 한 장의 한국 민화 도안을 색칠하는 모바일 웹 서비스. 광고 시청 시 추가 도안 1장 해금. 완성한 그림은 PNG로 기기에 저장 가능.

---

## 2. 기술 스택 & 파일 구조

### 스택
| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 14** (`output: 'export'`) | 앱인토스 전환을 위한 정적 빌드 호환 |
| UI | **Tailwind CSS** | 유틸리티 클래스 기반 빠른 스타일링 |
| 애니메이션 | **Framer Motion 12** | 화면 전환 spring/AnimatePresence |
| 캔버스 | **HTML5 Canvas API** (다층 레이어) | 선화 overlay + 사용자 붓질 분리 |
| 상태 | **React useState + localStorage** | 일별 리셋, 연속 방문 스트릭 |
| 폰트 | **Pretendard** (CDN) | 한국어 최적화 |
| 광고 | **adsInToss.js** (앱인토스/Mock 분기) | Vercel=Mock(3초), 앱인토스=AdMob |
| 배포 | **Vercel** (GitHub 자동배포) | QA 단계 |

### 파일 구조
```
민화-색칠하기/
├── app/
│   ├── globals.css          # 커스텀 CSS (image-card, 스크롤바 등)
│   ├── layout.js            # 루트 레이아웃 (Pretendard CDN, viewport)
│   └── page.js              # HOME | PAINTING | COMPLETE 상태머신
├── components/
│   ├── HomeScreen.jsx       # 갤러리 + 광고 버튼 + 스트릭
│   ├── PaintingScreen.jsx   # 캔버스 + 툴바 조합 화면
│   │   ├── PaintingCanvas.jsx  # PaintingEngine 마운트 래퍼
│   │   ├── ToolBar.jsx         # 뒤로/undo/redo/완성 버튼
│   │   ├── ColorPalette.jsx    # 오방색 + 단청 팔레트 + 커스텀 색상
│   │   └── BrushSelector.jsx   # 붓 탭 + 사이즈 슬라이더
│   └── CompleteScreen.jsx   # 완성 이미지 + 저장 + 홈 버튼
├── lib/
│   ├── PaintingEngine.js    # 핵심 캔버스 엔진 (레이어, 붓, flood fill, undo)
│   ├── adsInToss.js         # 광고 연동 (앱인토스/Mock 분기)
│   ├── colors.js            # 오방색 5색 + 단청 22색 + 붓 타입 정의
│   ├── imageSchedule.js     # KST 기반 일별 이미지 로테이션
│   └── paintState.js        # localStorage 읽기/쓰기 (SSR 가드 포함)
├── public/images/
│   └── 일월오봉도.png       # 첫 번째 민화 선화 이미지 (680×321px)
├── tools/
│   ├── convert-lineart.html # 컬러 PNG → 선화 PNG 변환 도구
│   └── generate-assets.html # 앱스토어 에셋 생성기 (앱인토스 전환 시 사용)
├── vercel.json              # Vercel 빌드 설정
├── next.config.js           # output: export, trailingSlash
├── tailwind.config.js       # 오방색 토큰, Pretendard
└── DEVLOG.md                # 이 파일
```

### 화면 상태머신
```
[HOME]
  ├─ 오늘의 도안 카드 탭 → [PAINTING] (slot: 'daily')
  ├─ 광고 보기 버튼 → showAd() → extraUnlocked=true → 추가 카드 노출
  ├─ 추가 도안 카드 탭 → [PAINTING] (slot: 'extra')
  └─ 모두 완료 시 → "내일 새 그림이 기다려요!" 메시지

[PAINTING]
  ├─ 완성! 버튼 → [COMPLETE]
  └─ 뒤로가기 → [HOME] (진행 상태 자동 저장)

[COMPLETE]
  ├─ 저장하기 → PNG 다운로드
  └─ 홈으로 → [HOME]
```

---

## 3. 캔버스 아키텍처 — 4레이어 구조

```
Layer 0: bgCanvas      — 흰 배경 (정적, export 포함)
Layer 1: paintCanvas   — 사용자 붓질 (저장/복원 대상, export 포함)
Layer 2: lineArtCanvas — 흑백 선화 PNG (mix-blend-mode: multiply)
Layer 3: uiCanvas      — 커서 UI (이벤트 수신, export 미포함)
```

**multiply 블렌드 원리**: 선화의 흰 영역은 아래 채색 색상을 그대로 통과. 검은 선은 항상 검은색 유지 → 채색이 선을 "덮지" 않음.

### PaintingEngine 주요 메서드
```js
class PaintingEngine {
  loadLineArt(src)        // PNG 로드 → lineArtCanvas에 그리기
  setColor(hex)           // 현재 색상 변경
  setBrush(config)        // { type, size, opacity }
  startStroke(x, y)       // 새 획 시작 (history 스냅샷)
  continueStroke(x, y)   // 가중평균 스무딩 [0.1, 0.2, 0.3, 0.4]
  endStroke()             // history push + debounced auto-save
  floodFill(x, y)         // 스캔라인 BFS, lineArt alpha>128 = 경계
  undo() / redo()         // max 20 스냅샷
  exportComposite()       // bg + paint + lineart → dataURL
  serialize()             // paintCanvas → base64 (localStorage용)
  deserialize(base64)     // 이전 진행 상태 복원
  hasSufficientCoverage() // 채색 완성도 3% 이상 시 완성 버튼 활성화
}
```

### 터치 이벤트 처리
- 모든 포인터 이벤트는 uiCanvas(최상단)에서 수신
- `touchstart/touchmove preventDefault({ passive: false })` → iOS 스크롤 차단
- 모든 좌표: `clientX / devicePixelRatio` 보정 필수

---

## 4. 붓 종류 & 색칠 엔진

| 붓 | 특성 |
|---|---|
| 둥근 붓 | 기본, 원형 cap, shadowBlur:2 |
| 세밀 붓 | 3~8px, 민화 선 작업 핵심 |
| 납작 붓 | 스트로크 방향으로 회전한 타원형 |
| 수채화 붓 | 3중 패스 globalAlpha:0.08, 부드러운 번짐 |
| 채우기 | 단일 탭 flood fill (버킷) |

### 색상 팔레트 (`lib/colors.js`)
- **오방색 5색** (상단, 레이블): 청 `#2B5FA5` / 적 `#C0392B` / 황 `#D4A017` / 백 `#F5F5F0` / 흑 `#1A1A1A`
- **단청 확장 22색** (스크롤): 주홍/홍/분홍/감청/군청/녹/연두/황토/갈색/자주/보라 등
- **커스텀**: `<input type="color">` 자유 색상 선택기

---

## 5. 이미지 변환 도구 (tools/convert-lineart.html)

빌드 도구 없이 **브라우저에서 바로 실행**되는 단일 HTML 파일.
컬러 민화 PNG를 흑백 선화 PNG로 변환.

### 변환 파이프라인
```
1. FileReader → Canvas 로드
2. 그레이스케일: gray = 0.299R + 0.587G + 0.114B
3. 가우시안 블러 (radius 1.5) — 노이즈 제거
4. Sobel 엣지 검출: Gx/Gy 커널 → magnitude = √(Gx² + Gy²)
5. 히스테리시스 임계값 (Low/High 슬라이더 조절)
6. 선 두께 팽창 (1~3px)
7. 출력: 검은 선 + 흰 배경 PNG (최대 너비 750px)
```

### 사용법
1. `tools/convert-lineart.html` 브라우저에서 직접 열기
2. 민화 이미지 업로드
3. Low/High Threshold, 선 두께 슬라이더 조절
4. PNG 다운로드 → `public/images/` 에 저장

---

## 6. 일별 이미지 시스템 & localStorage

### 이미지 로테이션 (`lib/imageSchedule.js`)
```js
// KST 기준 연도 내 일수를 이미지 배열 길이로 나눈 나머지
// → 날짜가 바뀌면 이미지가 자동 교체, 결정론적(서버 불필요)
getDailyImage()  // 오늘의 이미지
getExtraImage()  // 광고 해금 추가 이미지 (다음 인덱스)
```

### localStorage 스키마
```
minhwa_dailyDate        → 'YYYY-MM-DD'  (KST, 매일 리셋 기준)
minhwa_dailyComplete    → 'true'
minhwa_extraUnlocked    → 'true'        (광고 시청 완료)
minhwa_extraComplete    → 'true'
minhwa_streakCount      → '7'
minhwa_lastVisitDate    → 'YYYY-MM-DD'

// 진행 상태 (날짜와 무관하게 유지)
minhwa_paint_{imageId}    → base64 PNG
minhwa_paint_{imageId}_ts → timestamp
```

**일별 리셋 대상**: dailyComplete, extraUnlocked, extraComplete
**유지 대상**: 페인트 진행상태 (paint_*) — 다음 날 이어 그리기 가능

### SSR 가드 (`lib/paintState.js`)
```js
// Next.js 빌드 시 Node.js 환경에서 localStorage 접근하면 에러 발생
// 반드시 window 존재 여부를 확인한 후 접근
function ls() {
  return typeof window !== 'undefined' ? window.localStorage : null
}
// 모든 localStorage 접근은 ls()?.getItem(...) 형태로 사용
```

---

## 7. 배포 파이프라인 (Vercel)

### 현재 구성
```
로컬 수정
    ↓
git add [파일] && git commit -m "..." && git push
    ↓
GitHub (bd-yoon/minhwa-color) main 브랜치
    ↓
Vercel 자동 감지 → npm run build → out/ 생성 → 배포 (약 1~2분)
    ↓
https://minhwa-color.vercel.app 업데이트
```

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "installCommand": "npm install"
}
```

> ⚠️ `"framework": "nextjs"` 를 추가하면 Vercel 내장 Next.js 통합과 충돌하여
> `outputDirectory: "out"` 설정이 무시됨. **framework 키는 넣지 말 것.**

---

## 8. ⚠️ 이번 개발에서 겪은 어려움 — 원인 분석 & 재발 방지책

> **핵심 교훈**: 이전 두 프로젝트(소원성취, 3 bottle game)는 처음부터 앱인토스 환경을 타겟으로 개발했다. 민화 색칠하기는 "Vercel 먼저, 나중에 앱인토스 전환"을 계획했음에도, **앱인토스 전용 코드를 Vercel 타겟 프로젝트에 그대로 복사한 것**이 모든 문제의 근본 원인이었다.

---

### 🔴 문제 1: `@toss/tds-mobile` 브라우저 실행 오류 — 가장 결정적인 문제

**증상**
```
Error: @toss/tds-mobile은 앱인토스 개발에만 사용할 수 있어요.
Uncaught Error: Minified React error #423
```
→ Vercel 배포 후 앱이 완전히 흰 화면으로 멈춤.

**원인 분석**

`소원성취 향초 켜기`에서 `TDSWrapper.jsx`를 복사해왔다. 소원성취는 이미 Apps-in-Toss 환경에서 실행되므로 문제가 없었지만, `@toss/tds-mobile` 패키지는 **실행 시점에 Apps-in-Toss 환경 여부를 체크**하고, 일반 브라우저라면 즉시 에러를 던진다.

```
계획: "Vercel 배포 → QA → 나중에 앱인토스 전환"
구현: TDSWrapper(앱인토스 전용 코드)를 layout.js에 포함 ← 모순
```

**수정**
- `app/layout.js`에서 `TDSWrapper` import 및 래핑 제거
- `{children}` 직접 렌더링으로 변경
- 실제로 TDS UI 컴포넌트(Button 등)를 아무것도 쓰지 않았으므로 기능 손실 없음

**재발 방지 규칙** ⭐
> Vercel(일반 브라우저) 타겟으로 개발할 때는 `@toss/tds-mobile`과 `TDSWrapper`를 절대 포함하지 않는다.
> 앱인토스 전환 단계에서 추가한다.
> "나중에 쓸 거니까 미리 복사해두자"는 생각이 이 문제를 만들었다.

---

### 🟡 문제 2: `localStorage is not defined` 빌드 오류

**증상**
```
ReferenceError: localStorage is not defined
  at paintState.js
```
→ Vercel 빌드 실패.

**원인 분석**

Next.js `output: 'export'`는 빌드 시 각 페이지를 Node.js 환경에서 한 번 실행(정적 생성)한다. Node.js에는 `localStorage`가 없다. `paintState.js`에서 모듈 로드 시점에 `localStorage`에 직접 접근하고 있었다.

**수정**
```js
// 모든 localStorage 접근을 이 함수를 통해서만 하도록 변경
function ls() {
  return typeof window !== 'undefined' ? window.localStorage : null
}
// 사용: ls()?.getItem(key) — window 없으면 null 반환
```

**재발 방지 규칙**
> Next.js 프로젝트에서 `localStorage`, `sessionStorage`, `window`, `document`에 접근하는 코드는 반드시 `typeof window !== 'undefined'` 가드를 포함한다.
> `useEffect` 내부에서 접근하는 것도 안전한 방법이다.

---

### 🟡 문제 3: Vercel `vercel.json` 설정 충돌

**증상**
```
Build failed: Output directory "out" does not exist
```
또는
```
404 NOT_FOUND
```

**원인 분석**

두 번의 시행착오가 있었다:

1. **첫 시도**: `vercel.json` 없음 → Vercel CLI가 프레임워크를 감지 못하고 `public/` 디렉토리를 찾아 404
2. **두 번째 시도**: `"framework": "nextjs"` + `"outputDirectory": "out"` 동시 사용
   → Vercel 내장 Next.js 통합이 활성화되면서 `outputDirectory` 설정을 무시, `out/` 폴더를 못 찾음

**올바른 vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "installCommand": "npm install"
}
```
`"framework"` 키를 넣지 않으면 Vercel이 빌드 명령을 우리가 지정한 대로 실행하고, `out/` 폴더를 그대로 서빙한다.

**재발 방지 규칙**
> Next.js `output: 'export'`를 Vercel에 배포할 때 `vercel.json`에 `"framework": "nextjs"`를 넣지 않는다.
> `buildCommand` + `outputDirectory` 조합만 사용한다.

---

### 🟢 문제 4: Vercel 배포 인증 (팀 계정 이슈)

**증상**: 모바일에서 배포 URL 접속 시 Vercel 로그인 요청

**원인**: Vercel CLI로 배포 시 팀 계정(`bottleisland1-3730s-projects`) 소속으로 배포됨. 팀 프로젝트는 기본적으로 Deployment Protection이 활성화됨.

**해결**: 프로덕션 URL(`minhwa-color.vercel.app`)은 공개 접근 가능. 해시 URL(preview deployment)만 인증 필요.

**재발 방지 규칙**
> Vercel 팀 계정 배포 시 모바일 QA는 반드시 `{project-name}.vercel.app` 형태의 프로덕션 URL로 테스트한다.
> 해시 URL은 팀 내부용(인증 필요).

---

### 📌 이번 교훈의 핵심 요약

이전 두 프로젝트에서는 문제가 없었던 이유:
- **소원성취**: 처음부터 앱인토스 타겟 → TDS가 정상 동작
- **3 bottle game**: Vite 사용 → SSR 없음, TDS 미사용 (게임 타입)

민화 색칠하기에서 문제가 생긴 이유:
- **계획(Vercel 먼저)과 구현(앱인토스 코드 복사)의 불일치**
- 이전 프로젝트 코드를 "혹시 나중에 쓸까봐" 그대로 복사한 것이 화근

**앞으로 새 프로젝트 시작 시 체크리스트**:
- [ ] 배포 타겟이 Vercel(일반 브라우저)이면 `@toss/tds-mobile` 설치/import 금지
- [ ] Next.js라면 모든 browser API 접근에 `typeof window !== 'undefined'` 가드
- [ ] `vercel.json`에 `"framework"` 키 넣지 않기
- [ ] 이전 프로젝트 코드 복사 시, "지금 이 환경에서 실행 가능한가?" 먼저 확인

---

## 9. 앱인토스 전환 (미완료)

Vercel QA 완료 후 아래 순서로 진행.

### 전환 시 할 일

1. **앱인토스 콘솔에서 앱 생성** → 영문 appName 확정
2. **패키지 설치**
   ```bash
   npm install @toss/tds-mobile
   ```
3. **`app/TDSWrapper.jsx` 복원** (소원성취 참고)
   ```jsx
   'use client'
   import { TDSMobileProvider, useUserAgent } from '@toss/tds-mobile'
   export default function TDSWrapper({ children }) {
     const userAgent = useUserAgent()
     return <TDSMobileProvider userAgent={userAgent} resetGlobalCss={false}>{children}</TDSMobileProvider>
   }
   ```
4. **`app/layout.js`에 TDSWrapper 재적용**
5. **`granite.config.ts` 작성** (비게임 WebView 타입, `outdir: 'out'`)
   ```typescript
   import { defineConfig } from '@apps-in-toss/web-framework/config'
   export default defineConfig({
     appName: '{결정된 appName}',
     brand: { displayName: '민화 색칠하기', primaryColor: '#C0392B', icon: '' },
     web: { host: 'localhost', port: 3000, commands: { dev: 'next dev', build: 'next build' } },
     outdir: 'out',
     webViewProps: { type: 'partner', bounces: false, pullToRefreshEnabled: false, mediaPlaybackRequiresUserAction: false },
     permissions: [],
   })
   ```
6. **`package.json`에 스크립트 추가**
   ```json
   "granite:build": "granite build"
   ```
7. **`lib/adsInToss.js`** 광고 ID를 실제 AdMob Unit ID로 교체 (개인사업자 등록 완료 후)
8. **`npm run granite:build`** → `{appName}.ait` 생성 확인
9. **콘솔 업로드 & 심사**

---

## 10. 다음 민화 이미지 추가 방법

1. `tools/convert-lineart.html`로 컬러 민화 PNG → 선화 PNG 변환
2. `public/images/` 에 파일 저장 (예: `모란꽃.png`)
3. `lib/imageSchedule.js`의 `IMAGES` 배열에 항목 추가
   ```js
   {
     id: '모란꽃',           // localStorage 키에 사용 (고유값, 영문 권장)
     title: '모란꽃',
     subtitle: '화조도',
     file: '/images/모란꽃.png',
     thumbnail: '/images/모란꽃.png',
     aspect: '3/4',         // 실제 이미지 비율 (가로/세로)
   }
   ```
4. git push → Vercel 자동 배포

---

## 참고 링크

| 링크 | 설명 |
|------|------|
| https://github.com/bd-yoon/minhwa-color | 소스코드 |
| https://minhwa-color.vercel.app | Vercel 배포 (QA용) |
| `소원성취 향초 켜기/DEVLOG.md` | 앱인토스 공통 설정 (계정, TDS, granite, 광고) |
| https://console-apps-in-toss.toss.im/ | 앱인토스 콘솔 |
