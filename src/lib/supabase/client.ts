/**
 * lib/supabase/client.ts — 브라우저용 Supabase 클라이언트
 *
 * 클라이언트 컴포넌트('use client')에서 Supabase에 접근할 때 사용합니다.
 * - 브라우저 환경에서 실행되므로 ANON_KEY만 사용 (보안상 안전)
 * - RLS 정책에 의해 현재 로그인된 사용자의 데이터만 접근 가능
 * - 인증 상태(세션)는 쿠키를 통해 자동 관리됨
 *
 * 사용 예시:
 *   import { createClient } from '@/lib/supabase/client'
 *   const supabase = createClient()
 *   const { data } = await supabase.from('gmb_countries').select('*')
 */
import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저용 Supabase 클라이언트 생성 함수
 *
 * @returns Supabase 클라이언트 인스턴스 (브라우저 환경)
 *
 * ※ NEXT_PUBLIC_ 접두사가 붙은 환경변수만 브라우저에서 접근 가능
 * ※ 이 클라이언트는 RLS(Row Level Security)가 적용된 상태로 동작
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,     // Supabase 프로젝트 URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // 공개 API 키 (RLS 적용됨)
  )
}
