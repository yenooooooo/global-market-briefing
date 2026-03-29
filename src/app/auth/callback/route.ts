/**
 * auth/callback/route.ts — Supabase Auth 콜백 핸들러
 *
 * 이메일 확인 링크를 클릭했을 때 Supabase가 리다이렉트하는 엔드포인트입니다.
 *
 * 플로우:
 * 1. 사용자가 회원가입 후 이메일의 확인 링크 클릭
 * 2. Supabase가 이 URL로 리다이렉트 (code 파라미터 포함)
 * 3. code를 세션으로 교환 (exchangeCodeForSession)
 * 4. /home으로 리다이렉트 (로그인 완료)
 *
 * ※ Supabase 대시보드에서 Redirect URL을 이 경로로 설정해야 합니다:
 *    http://localhost:3000/auth/callback (로컬)
 *    https://your-domain.vercel.app/auth/callback (프로덕션)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET 핸들러 — 이메일 확인 콜백 처리
 *
 * @param request - Supabase가 보내는 리다이렉트 요청 (code 파라미터 포함)
 * @returns /home으로 리다이렉트 (성공) 또는 /login으로 리다이렉트 (실패)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  /* URL에서 인증 코드 추출 */
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    /* 인증 코드를 세션(액세스 토큰 + 리프레시 토큰)으로 교환 */
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 세션 교환 성공 → 홈 대시보드로 이동
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  // 코드가 없거나 세션 교환 실패 → 로그인 페이지로 이동
  return NextResponse.redirect(`${origin}/login`)
}
