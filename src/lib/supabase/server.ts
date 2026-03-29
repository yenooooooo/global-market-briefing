/**
 * lib/supabase/server.ts — 서버용 Supabase 클라이언트
 *
 * 서버 컴포넌트, API Route, Server Action에서 Supabase에 접근할 때 사용합니다.
 * - Next.js의 cookies()를 통해 인증 세션을 관리
 * - 서버 사이드에서 실행되므로 쿠키 기반 인증이 자동으로 적용됨
 * - RLS 정책에 의해 현재 로그인된 사용자의 데이터만 접근 가능
 *
 * 사용 예시:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('gmb_monthly_sales').select('*')
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버용 Supabase 클라이언트 생성 함수
 *
 * @returns Promise<SupabaseClient> — 서버 환경의 Supabase 클라이언트
 *
 * ※ 이 함수는 async — cookies()가 Next.js 15에서 비동기이기 때문
 * ※ 매 요청마다 새로운 클라이언트를 생성하여 세션 격리를 보장
 */
export async function createClient() {
  /* Next.js의 쿠키 저장소에 접근 */
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Supabase 프로젝트 URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // 공개 API 키
    {
      cookies: {
        /**
         * 쿠키 전체 목록 조회
         * Supabase가 인증 토큰을 쿠키에서 읽을 때 사용
         */
        getAll() {
          return cookieStore.getAll()
        },

        /**
         * 쿠키 설정 (인증 토큰 갱신 시 호출)
         * 서버 컴포넌트에서는 쿠키 설정이 불가능할 수 있으므로 try-catch 처리
         *
         * @param cookiesToSet - 설정할 쿠키 배열 [{name, value, options}]
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 서버 컴포넌트에서 쿠키를 설정하려고 하면 에러 발생 가능
            // 이 경우 미들웨어가 세션 갱신을 대신 처리함
          }
        },
      },
    }
  )
}
