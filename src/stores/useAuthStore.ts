/**
 * stores/useAuthStore.ts — 인증 상태 관리 스토어 (Zustand)
 *
 * Supabase Auth의 사용자 세션 정보를 전역 상태로 관리합니다.
 * 클라이언트 컴포넌트에서 현재 로그인된 사용자 정보에 접근할 때 사용합니다.
 *
 * 사용 예시:
 *   const { user, isLoading } = useAuthStore()
 *   if (!user) return <LoginPage />
 */
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

/** 인증 스토어의 상태 타입 정의 */
interface AuthState {
  user: User | null       // 현재 로그인된 사용자 (null이면 비로그인)
  isLoading: boolean      // 인증 상태 확인 중 여부 (초기 로딩)
  setUser: (user: User | null) => void      // 사용자 정보 설정
  setLoading: (loading: boolean) => void    // 로딩 상태 설정
}

/**
 * 인증 상태 Zustand 스토어
 *
 * - user: Supabase Auth의 User 객체 (이메일, ID 등 포함)
 * - isLoading: 앱 초기 로드 시 세션 확인 완료 전까지 true
 * - setUser: 로그인/로그아웃 시 사용자 정보 업데이트
 * - setLoading: 세션 확인 완료 후 false로 변경
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
