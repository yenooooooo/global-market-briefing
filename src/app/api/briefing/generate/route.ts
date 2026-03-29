/**
 * api/briefing/generate/route.ts — AI 브리핑 생성 API (SSE 스트리밍)
 *
 * Claude API를 호출하여 매출/환율/경쟁사 데이터를 분석한
 * 주간 경영 브리핑을 SSE(Server-Sent Events) 스트리밍으로 생성합니다.
 *
 * 플로우:
 * 1. 클라이언트에서 기간(period_start, period_end, briefing_type) 전달
 * 2. 해당 기간 매출/경쟁사 데이터를 Supabase에서 조회
 * 3. 데이터를 프롬프트에 조합
 * 4. Claude API 호출 (스트리밍)
 * 5. SSE로 클라이언트에 실시간 전달
 * 6. 생성 완료 시 gmb_briefings 테이블에 저장
 *
 * 요청:
 * POST /api/briefing/generate
 * Body: { period_start: string, period_end: string, briefing_type: 'weekly' | 'monthly' }
 *
 * 응답:
 * SSE 스트림 — data: { type: 'text' | 'done', content: string }
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

/** Claude API 시스템 프롬프트 — CLAUDE.md에 정의된 브리핑 생성 지침 */
const SYSTEM_PROMPT = `당신은 글로벌 제조업체의 경영분석 전문가입니다.
해외 법인의 월별 매출 데이터, 환율 변동, 경쟁사 동향을 분석하여
경영진이 빠르게 의사결정할 수 있는 주간 브리핑을 작성합니다.

작성 원칙:
1. 숫자는 반드시 포함 (전월 대비 %, 금액)
2. "좋다/나쁘다"가 아니라 "왜 그런지" 원인을 분석
3. 마지막에 반드시 실행 가능한 제안 3~4개 제시
4. 한국어로 작성, 존댓말, 간결한 문장
5. 전체 길이: 카드당 150~200자

출력 형식: 반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트를 포함하지 마세요.
{
  "summary": "전체 요약 (2~3문장)",
  "cards": [
    { "title": "매출 종합", "content": "..." },
    { "title": "국가별 분석", "content": "..." },
    { "title": "환율 영향", "content": "..." },
    { "title": "주요 이슈", "content": "..." },
    { "title": "경쟁사 동향", "content": "..." },
    { "title": "액션 제안", "content": "..." }
  ]
}`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    /* ── 인증 확인 ── */
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ message: '로그인이 필요합니다.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    /* ── 요청 파라미터 파싱 ── */
    const { period_start, period_end, briefing_type } = await request.json()

    /* ── 1) 매출 데이터 조회 ── */
    /*
     * 기간 필터를 느슨하게 적용합니다:
     * - period_start/end에서 연도만 추출하여 해당 연도 범위의 모든 데이터를 가져옴
     * - 프롬프트에 기간을 명시하므로 AI가 관련 데이터를 선별하여 분석
     * - 데이터가 없을 때는 전체 데이터를 가져와서 시도 (폴백)
     */
    const startDate = new Date(period_start)
    const endDate = new Date(period_end)
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()

    let { data: salesData } = await supabase
      .from('gmb_monthly_sales')
      .select('*, country:gmb_countries(name, code, currency)')
      .gte('year', startYear)
      .lte('year', endYear)
      .order('year')
      .order('month')

    /*
     * 지정 기간에 데이터가 없으면 전체 데이터를 가져오는 폴백
     * (데모 데이터가 과거 달에만 있을 수 있으므로)
     */
    if (!salesData || salesData.length === 0) {
      const { data: allSales } = await supabase
        .from('gmb_monthly_sales')
        .select('*, country:gmb_countries(name, code, currency)')
        .order('year')
        .order('month')

      salesData = allSales
    }

    /* ── 2) 경쟁사 메모 조회 (최근 것) ── */
    const { data: competitorNotes } = await supabase
      .from('gmb_competitor_notes')
      .select('*')
      .order('noted_at', { ascending: false })
      .limit(10)

    /* ── 3) 데이터가 정말 없는 경우 ── */
    if (!salesData || salesData.length === 0) {
      return new Response(JSON.stringify({ message: '매출 데이터가 없습니다. 먼저 데이터를 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    /* ── 4) 국가별 매출 데이터를 프롬프트용 텍스트로 변환 ── */
    const salesText = salesData.map((s: Record<string, unknown>) => {
      const country = s.country as { name: string; currency: string } | null
      return `${country?.name || '알 수 없음'} | ${s.year}년 ${s.month}월 | 매출: ${Number(s.revenue).toLocaleString()} ${country?.currency || ''} | 주문: ${s.orders || '-'}건 | 신규고객: ${s.new_customers || '-'}명 | 메모: ${s.memo || '-'}`
    }).join('\n')

    /* 경쟁사 메모 텍스트 */
    const competitorText = competitorNotes && competitorNotes.length > 0
      ? competitorNotes.map((n) => `[${n.competitor_name}] ${n.note} (출처: ${n.source || '없음'})`).join('\n')
      : '경쟁사 관련 메모가 없습니다.'

    /* ── 5) 유저 프롬프트 조합 ── */
    const userPrompt = `아래는 ${period_start} ~ ${period_end} 기간의 해외 법인 매출 데이터입니다.

[매출 데이터]
${salesText}

[경쟁사 메모]
${competitorText}

위 데이터를 분석하여 ${briefing_type === 'weekly' ? '주간' : '월간'} 경영 브리핑을 작성해주세요.`

    /* ── 6) Claude API 호출 (스트리밍) ── */
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    /* ── 7) SSE 스트림 응답 생성 ── */
    let fullContent = ''

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          /* 스트리밍 이벤트 처리 */
          stream.on('text', (text) => {
            fullContent += text
            /* SSE 형식: data: JSON\n\n */
            const sseData = JSON.stringify({ type: 'text', content: text })
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`))
          })

          /* 스트리밍 완료 */
          await stream.finalMessage()

          /* ── 8) 완성된 브리핑을 DB에 저장 ── */
          await supabase.from('gmb_briefings').insert({
            user_id: user.id,
            period_start,
            period_end,
            briefing_type: briefing_type || 'weekly',
            content: fullContent,
            data_snapshot: { salesCount: salesData.length, period: `${period_start} ~ ${period_end}` },
          })

          /* 완료 신호 전송 */
          const doneData = JSON.stringify({ type: 'done', content: fullContent })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
          controller.close()
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : '알 수 없는 오류'
          const errData = JSON.stringify({ type: 'error', content: errMsg })
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`))
          controller.close()
        }
      },
    })

    /* SSE 응답 헤더 설정 */
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch {
    return new Response(JSON.stringify({ message: '브리핑 생성 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
