import './globals.css'
import TDSWrapper from './TDSWrapper'

export const metadata = {
  title: '민화 색칠하기',
  description: '매일 한 장의 한국 민화를 색칠해보세요',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FDF8F3" />
      </head>
      <body className="bg-bg-main min-h-screen">
        <TDSWrapper>
          {children}
        </TDSWrapper>
      </body>
    </html>
  )
}
