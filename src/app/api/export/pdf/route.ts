/**
 * api/export/pdf/route.ts — PDF 내보내기 API
 *
 * AI 브리핑이나 매출 리포트를 PDF 파일로 변환하여 다운로드합니다.
 * Phase 5에서 본격 구현 예정.
 *
 * 사용 시나리오:
 * - AI 브리핑 6장 카드를 PDF로 내보내기
 * - 매출 현황 리포트 PDF 생성
 * - 이메일 첨부 파일용 PDF 생성
 */
import { NextResponse } from 'next/server'

export async function POST() {
  // Phase 5에서 구현 예정
  return NextResponse.json(
    { message: 'PDF 내보내기 API — 구현 예정' },
    { status: 501 }
  )
}
