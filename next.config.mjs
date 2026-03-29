/**
 * next.config.mjs — Next.js 14 설정 파일
 *
 * 글로벌 마켓 브리핑 프로젝트의 Next.js 빌드/런타임 설정을 정의합니다.
 * - Next.js 14에서는 .mjs 또는 .js 확장자만 지원 (.ts는 불가)
 * - 이미지 도메인, 리다이렉트, 환경변수 노출 등을 여기서 관리
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* ── 이미지 최적화 ── */
  // 외부 이미지 도메인이 필요하면 여기에 추가
  // images: {
  //   remotePatterns: [
  //     { protocol: 'https', hostname: 'example.com' },
  //   ],
  // },
}

export default nextConfig
