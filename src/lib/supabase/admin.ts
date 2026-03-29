/**
 * lib/supabase/admin.ts — 관리자용 Supabase 클라이언트 (Service Role)
 *
 * RLS(Row Level Security)를 우회하는 관리자 권한 클라이언트입니다.
 * - Service Role 키를 사용하므로 모든 테이블의 모든 데이터에 접근 가능
 * - 서버 사이드(API Route)에서만 사용 — 절대 클라이언트에 노출 금지!
 *
 * 사용 케이스:
 * - 환율 데이터 일괄 업데이트 (사용자 무관한 공용 데이터)
 * - 데모 데이터 시딩
 * - 관리자 통계 조회
 *
 * ⚠️ 주의: 이 클라이언트로 접근하면 RLS 정책이 무시됩니다.
 *         반드시 API Route 등 서버 환경에서만 사용하세요.
 */
import { createClient } from '@supabase/supabase-js'

/**
 * 관리자용 Supabase 클라이언트
 *
 * ※ SUPABASE_SERVICE_ROLE_KEY는 NEXT_PUBLIC_ 접두사가 없으므로
 *   브라우저에서는 접근 불가 (서버 전용)
 * ※ auth.admin 기능도 사용 가능 (사용자 관리 등)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // Supabase 프로젝트 URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!,       // Service Role 키 (RLS 우회)
  {
    auth: {
      autoRefreshToken: false,   // 서버 환경이므로 토큰 자동 갱신 불필요
      persistSession: false,     // 서버 환경이므로 세션 유지 불필요
    },
  }
)
