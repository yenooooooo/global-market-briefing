/**
 * opengraph-image.tsx — OG 이미지 자동 생성
 *
 * 링크 공유 시 표시되는 미리보기 이미지를 Next.js ImageResponse로 동적 생성합니다.
 * 카카오톡, 슬랙, 트위터 등에서 링크 붙여넣기 시 이 이미지가 표시됩니다.
 *
 * 크기: 1200x630 (OG 표준)
 */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '글로벌 마켓 브리핑 — 해외 법인 매출 AI 분석 대시보드'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#131314',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* 로고 */}
        <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.05em', marginBottom: 40 }}>
          MARKET BRIEFING
        </div>

        {/* 타이틀 */}
        <div style={{ fontSize: 64, fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
          7개국 실적을,
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: '#b7c4ff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 40 }}>
          하나의 화면에.
        </div>

        {/* 설명 */}
        <div style={{ fontSize: 24, color: '#c3c5d9', lineHeight: 1.5 }}>
          해외 법인 매출 시각화 + AI 주간 경영 브리핑 자동 생성 대시보드
        </div>

        {/* 하단 기술 스택 뱃지 */}
        <div style={{ display: 'flex', gap: 12, marginTop: 48 }}>
          {['Next.js', 'TypeScript', 'Supabase', 'Claude AI'].map((tech) => (
            <div
              key={tech}
              style={{
                backgroundColor: '#201f20',
                color: '#8d90a2',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 16,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
