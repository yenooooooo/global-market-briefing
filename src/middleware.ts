/**
 * middleware.ts — Next.js 미들웨어
 *
 * 모든 요청에 대해 실행되는 미들웨어입니다.
 * 주요 역할:
 * 1. Supabase 인증 세션 갱신 (만료된 토큰 자동 리프레시)
 * 2. 비로그인 사용자의 대시보드 접근을 /login으로 리다이렉트
 * 3. 로그인된 사용자의 /login, /signup 접근을 /home으로 리다이렉트
 *
 * ※ matcher 설정으로 정적 파일(_next, favicon 등)은 미들웨어를 건너뜁니다.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 미들웨어 핸들러 — 매 요청마다 실행
 *
 * @param request - 들어온 HTTP 요청 객체
 * @returns NextResponse — 수정된 응답 (쿠키 갱신 또는 리다이렉트)
 */
export async function middleware(request: NextRequest) {
  /* ── 응답 객체 생성 (쿠키 조작을 위해 복제) ── */
  let supabaseResponse = NextResponse.next({
    request,
  })

  /* ── Supabase 클라이언트 생성 (미들웨어용) ── */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 요청 쿠키에서 인증 토큰을 읽어옴
         */
        getAll() {
          return request.cookies.getAll()
        },

        /**
         * 응답 쿠키에 갱신된 인증 토큰을 설정
         * 요청 쿠키도 동시에 업데이트하여 후속 서버 컴포넌트에서 사용 가능하게 함
         *
         * @param cookiesToSet - 설정할 쿠키 배열
         */
        setAll(cookiesToSet) {
          // 요청 쿠키 업데이트 (서버 컴포넌트에서 읽을 수 있도록)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // 응답 객체 재생성 (업데이트된 요청 쿠키 반영)
          supabaseResponse = NextResponse.next({
            request,
          })

          // 응답 쿠키에도 설정 (브라우저에 전달)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /* ── 현재 로그인 상태 확인 ── */
  // getUser()를 호출하면 만료된 세션이 자동으로 갱신됨
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* ── 경로 기반 접근 제어 ── */
  const { pathname } = request.nextUrl

  // /demo 경로는 인증 체크 제외 (포트폴리오 시연용)
  if (pathname.startsWith('/demo')) return supabaseResponse

  // 대시보드 경로 목록 (로그인 필요)
  const protectedPaths = ['/home', '/sales', '/exchange', '/briefing', '/competitors', '/settings']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // 인증 페이지 경로 (이미 로그인된 사용자는 접근 불필요)
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  if (!user && isProtectedPath) {
    // 비로그인 사용자가 대시보드에 접근 → 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPath) {
    // 이미 로그인된 사용자가 로그인/회원가입 페이지 접근 → 홈으로 리다이렉트
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/**
 * 미들웨어 적용 범위 설정
 * - 정적 파일 (_next/static, _next/image, favicon.ico 등)은 제외
 * - API 라우트, 페이지 라우트만 미들웨어 실행
 */
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 미들웨어 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - 이미지 파일들 (.svg, .png, .jpg 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
