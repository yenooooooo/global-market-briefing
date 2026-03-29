/**
 * components/layout/Sidebar.tsx — 대시보드 사이드바
 *
 * stitch 디자인 시스템 적용:
 * - bg-surface-container-low (#1c1b1c) — Section Layer
 * - No-Line 룰: border 없이 배경색 차이로 메인 영역과 구분
 * - 활성 메뉴: bg-surface-container + 좌측 primary 바 (2px)
 * - 호버: hover:bg-surface-bright + transition duration-200
 * - 하단 유저: glass-morphism 카드
 * - 폰트: font-headline(로고), font-label(메뉴)
 */
'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, BarChart3, ArrowLeftRight, Bot, Building2, Settings, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { NAV_ITEMS } from '@/lib/constants/navigation'

/** 아이콘 매핑 */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home, BarChart3, ArrowLeftRight, Bot, Building2, Settings,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-col bg-surface-container-low shrink-0">
      {/* ── 로고 — stitch 네비바 로고와 동일 스타일 ── */}
      <div className="flex h-20 items-center px-6">
        <span className="text-xl font-black tracking-tighter text-white font-headline">
          MARKET<br />BRIEFING
        </span>
      </div>

      {/* ── 네비게이션 ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 rounded-xl px-4 py-3
                    font-medium transition-all duration-200
                    ${active
                      ? 'bg-surface-container text-primary border-l-[3px] border-primary'
                      : 'text-on-surface-variant hover:bg-surface-bright hover:text-white border-l-[3px] border-transparent'
                    }
                  `}
                >
                  {Icon && (
                    <Icon
                      size={20}
                      className={`transition-colors duration-200 ${
                        active ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'
                      }`}
                    />
                  )}
                  <span className="text-sm tracking-wide">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── 유저 정보 + 로그아웃 — glass-morphism 카드 ── */}
      <div className="px-4 py-6">
        <div className="glass-morphism-border rounded-xl px-4 py-4">
          <p className="text-sm font-bold text-white truncate">
            {user?.user_metadata?.name || '사용자'}
          </p>
          <p className="text-xs text-on-surface-variant truncate mt-1">
            {user?.email || ''}
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-outline hover:bg-surface-bright hover:text-danger transition-all duration-200"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  )
}
