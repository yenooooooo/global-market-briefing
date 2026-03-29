/**
 * components/providers/AuthProvider.tsx — 인증 상태 관리 Provider
 *
 * 앱 전체에서 Supabase 인증 상태를 감시하고 Zustand 스토어에 동기화합니다.
 *
 * 역할:
 * 1. 앱 로드 시 현재 세션(로그인 상태) 확인
 * 2. 인증 상태 변경 이벤트 감시 (로그인, 로그아웃, 토큰 갱신 등)
 * 3. 변경 시 useAuthStore의 user 상태를 자동 업데이트
 * 4. 로딩 중에는 children 대신 로딩 표시
 *
 * 사용 위치:
 * - 루트 layout.tsx 또는 대시보드 layout.tsx에서 children을 감쌈
 *
 * ※ 'use client' — Supabase 인증 리스너는 브라우저에서만 동작
 */
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * AuthProvider — 인증 상태를 감시하고 전역 스토어에 동기화하는 컴포넌트
 *
 * @param children - 인증 상태 로딩이 완료된 후 렌더링할 자식 요소
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    /**
     * 1) 현재 세션 확인 (앱 초기 로드)
     * - 이미 로그인된 상태라면 user 정보를 스토어에 저장
     * - 비로그인 상태면 user를 null로 설정
     */
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)  // 초기 로딩 완료
    }

    initializeAuth()

    /**
     * 2) 인증 상태 변경 이벤트 구독
     * - SIGNED_IN: 로그인 성공
     * - SIGNED_OUT: 로그아웃
     * - TOKEN_REFRESHED: 토큰 자동 갱신
     * - USER_UPDATED: 사용자 정보 변경
     *
     * 이벤트 발생 시 session에서 user 정보를 추출하여 스토어 업데이트
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    /* 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지) */
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  return <>{children}</>
}
