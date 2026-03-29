/**
 * layout.tsx — 루트 레이아웃
 *
 * Next.js App Router의 최상위 레이아웃 컴포넌트입니다.
 * - HTML 문서의 <html>, <body> 태그를 정의
 * - 다크 테마 ("The Digital Architect") 기본 적용
 * - AuthProvider: Supabase 인증 상태를 전역에서 감시
 * - Space Grotesk + Pretendard + Inter 3종 폰트 전략
 * - 메타데이터 (SEO, 파비콘 등) 설정
 */
import type { Metadata } from 'next'
import AuthProvider from '@/components/providers/AuthProvider'
import './globals.css'

/**
 * 메타데이터 — SEO 및 브라우저 탭 정보
 * Next.js가 자동으로 <head> 태그에 삽입합니다.
 */
export const metadata: Metadata = {
  title: '글로벌 마켓 브리핑 | 해외 법인 경영 데이터 AI 분석',
  description:
    '7개국 해외 법인의 매출 데이터를 시각화하고, AI가 주간 경영 브리핑을 자동 생성하는 대시보드',
  keywords: ['글로벌', '매출 분석', 'AI 브리핑', '해외 법인', '경영 대시보드'],
}

/**
 * RootLayout — 앱 전체를 감싸는 최상위 레이아웃
 *
 * @param children - 각 페이지 컴포넌트가 이 위치에 렌더링됩니다
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased bg-surface text-on-surface selection:bg-primary selection:text-on-primary">
        {/*
          AuthProvider:
          - Supabase 인증 상태 변화를 감시
          - 로그인/로그아웃 시 useAuthStore를 자동 업데이트
          - 모든 하위 컴포넌트에서 useAuthStore()로 인증 상태 접근 가능
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
