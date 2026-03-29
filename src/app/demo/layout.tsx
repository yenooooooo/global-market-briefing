/**
 * demo/layout.tsx — 데모 페이지 전용 레이아웃
 *
 * 로그인 없이 대시보드를 체험할 수 있는 데모 레이아웃입니다.
 * 실제 대시보드와 동일한 사이드바 + 헤더 구조이지만,
 * 상단에 "데모 모드" 배너가 표시됩니다.
 */
import Link from 'next/link'
import { Home, BarChart3, Bot, ArrowLeftRight } from 'lucide-react'

/** 데모용 사이드바 메뉴 */
const DEMO_NAV = [
  { label: '홈', href: '/demo', icon: Home },
  { label: '매출 현황', href: '/demo#sales', icon: BarChart3 },
  { label: 'AI 브리핑', href: '/demo#briefing', icon: Bot },
  { label: '환율', href: '/demo#exchange', icon: ArrowLeftRight },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── 사이드바 ── */}
      <aside className="sticky top-0 flex h-screen w-[240px] flex-col bg-surface-container-low shrink-0">
        <div className="flex h-20 items-center px-6">
          <span className="text-xl font-black tracking-tighter text-white font-headline">
            MARKET<br />BRIEFING
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {DEMO_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-on-surface-variant hover:bg-surface-bright hover:text-white border-l-[3px] border-transparent transition-all duration-200"
                >
                  <item.icon size={20} className="text-outline group-hover:text-on-surface-variant transition-colors" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단: 로그인 유도 */}
        <div className="px-4 py-6">
          <Link
            href="/signup"
            className="block w-full text-center bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-3 rounded-xl font-headline font-bold text-sm hover:scale-[1.02] transition-all"
          >
            무료로 시작하기
          </Link>
        </div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── 데모 모드 배너 ── */}
        <div className="bg-primary-container text-on-primary-container text-center py-2 text-sm font-medium">
          데모 모드로 보고 있습니다 · 실제 데이터가 아닌 샘플 데이터입니다 ·{' '}
          <Link href="/signup" className="underline underline-offset-2 font-bold">회원가입하여 시작하기</Link>
        </div>

        {/* ── 헤더 ── */}
        <header className="sticky top-0 z-40 bg-[#131314]/60 backdrop-blur-xl shadow-[0px_24px_48px_rgba(0,0,0,0.4)]">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
            <h2 className="font-headline text-xl font-bold text-white tracking-tight">데모 대시보드</h2>
            <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
              DEMO MODE
            </span>
          </div>
        </header>

        {/* ── 콘텐츠 ── */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
