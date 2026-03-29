/**
 * (dashboard)/layout.tsx — 대시보드 공통 레이아웃
 *
 * 대시보드 내 모든 페이지(홈, 매출, 환율, 브리핑, 경쟁사, 설정)에
 * 공통으로 적용되는 레이아웃입니다.
 *
 * "The Digital Architect" 다크 테마 기반 구조:
 * ┌──────────────────┬────────────────────────────────┐
 * │                  │  Header (Glassmorphism 네비바)  │
 * │    Sidebar       │  sticky, glass-morphism        │
 * │   (240px)        ├────────────────────────────────┤
 * │  surface-        │                                │
 * │  container-low   │  Main Content                  │
 * │                  │  surface 배경                  │
 * │  메뉴 6개        │  max-width: 1200px             │
 * │  유저 정보       │  padding: 24px                 │
 * │  로그아웃        │                                │
 * └──────────────────┴────────────────────────────────┘
 *
 * No-Line 룰 적용:
 * - 사이드바와 메인 영역 사이에 border 없음
 * - surface-container-low(사이드바)와 surface(메인)의 배경색 차이로 구분
 */
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── 사이드바 (좌측 고정 240px) ── */}
      <Sidebar />

      {/* ── 메인 콘텐츠 영역 — min-w-0으로 flex 자식 넘침 방지 ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── 헤더 (Glassmorphism, sticky) ── */}
        <Header />

        {/* ── 페이지 콘텐츠 — overflow-x-hidden으로 가로 넘침 방지 ── */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
