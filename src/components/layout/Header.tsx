/**
 * components/layout/Header.tsx — 대시보드 상단 헤더
 *
 * stitch 디자인 시스템 적용:
 * - fixed 네비바와 동일한 glassmorphism: bg-[#131314]/60 + backdrop-blur-xl
 * - shadow-[0px_24px_48px_rgba(0,0,0,0.4)] — stitch ambient shadow
 * - 좌측: 페이지 제목 (font-headline font-bold)
 * - 우측: 날짜 (font-label uppercase tracking-widest)
 */
'use client'

import { usePathname } from 'next/navigation'

/** 경로 → 제목 매핑 (긴 경로 먼저 매칭) */
const PAGE_TITLES: Record<string, string> = {
  '/home': '홈 대시보드',
  '/sales/upload': '매출 데이터 입력',
  '/sales': '매출 현황',
  '/exchange': '환율 현황',
  '/briefing/archive': '브리핑 아카이브',
  '/briefing': 'AI 브리핑',
  '/competitors': '경쟁사 메모',
  '/settings': '설정',
  '/onboarding': '시작하기',
}

function getPageTitle(pathname: string): string {
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)
  for (const path of sorted) {
    if (pathname.startsWith(path)) return PAGE_TITLES[path]
  }
  return '대시보드'
}

function getTodayFormatted(): string {
  const today = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]})`
}

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-[#131314]/60 backdrop-blur-xl shadow-[0px_24px_48px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
        <h2 className="font-headline text-xl font-bold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h2>
        <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
          {getTodayFormatted()}
        </span>
      </div>
    </header>
  )
}
