/**
 * lib/constants/demoData.ts — 데모 페이지용 하드코딩 데이터
 *
 * 로그인 없이 대시보드를 체험할 수 있도록
 * 7개국 × 12개월 매출 + 환율 + AI 브리핑 데이터를 제공합니다.
 */
import type { Country, SalesWithCountry, BriefingCard } from '@/types'

/** 7개국 데모 국가 데이터 */
export const DEMO_COUNTRIES: Country[] = [
  { id: 'd1', user_id: 'demo', name: '미국', code: 'US', currency: 'USD', created_at: '' },
  { id: 'd2', user_id: 'demo', name: '인도', code: 'IN', currency: 'INR', created_at: '' },
  { id: 'd3', user_id: 'demo', name: '폴란드', code: 'PL', currency: 'PLN', created_at: '' },
  { id: 'd4', user_id: 'demo', name: '중국', code: 'CN', currency: 'CNY', created_at: '' },
  { id: 'd5', user_id: 'demo', name: '일본', code: 'JP', currency: 'JPY', created_at: '' },
  { id: 'd6', user_id: 'demo', name: '독일', code: 'DE', currency: 'EUR', created_at: '' },
  { id: 'd7', user_id: 'demo', name: '베트남', code: 'VN', currency: 'VND', created_at: '' },
]

/** 국가별 매출 기본값 + 변동폭 */
const REVENUE_BASE: Record<string, { base: number; variance: number }> = {
  d1: { base: 1_250_000, variance: 150_000 },
  d2: { base: 85_000_000, variance: 12_000_000 },
  d3: { base: 420_000, variance: 60_000 },
  d4: { base: 3_200_000, variance: 400_000 },
  d5: { base: 18_500_000, variance: 2_500_000 },
  d6: { base: 380_000, variance: 50_000 },
  d7: { base: 2_800_000_000, variance: 400_000_000 },
}

/** 시드 기반 난수 생성 (동일 입력 → 동일 출력) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/** 12개월 매출 데모 데이터 생성 */
export function generateDemoSales(): SalesWithCountry[] {
  const sales: SalesWithCountry[] = []
  const now = new Date()

  DEMO_COUNTRIES.forEach((country) => {
    const rev = REVENUE_BASE[country.id]
    if (!rev) return

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const seed = parseInt(country.id.slice(1)) * 100 + (11 - i)
      const trend = 1 + (11 - i) * 0.012
      const random = (seededRandom(seed) - 0.5) * 2 * rev.variance
      const revenue = Math.round(rev.base * trend + random)

      sales.push({
        id: `demo-${country.id}-${year}-${month}`,
        user_id: 'demo',
        country_id: country.id,
        year,
        month,
        revenue,
        revenue_krw: null,
        orders: Math.floor(seededRandom(seed + 1) * 60) + 10,
        new_customers: Math.floor(seededRandom(seed + 2) * 25) + 2,
        memo: null,
        created_at: '',
        country,
      })
    }
  })

  return sales
}

/** 데모 환율 데이터 */
export const DEMO_EXCHANGE_RATES = [
  { currency: 'USD', rate_to_krw: 1450 },
  { currency: 'INR', rate_to_krw: 17 },
  { currency: 'PLN', rate_to_krw: 370 },
  { currency: 'CNY', rate_to_krw: 200 },
  { currency: 'JPY', rate_to_krw: 9.7 },
  { currency: 'EUR', rate_to_krw: 1580 },
  { currency: 'VND', rate_to_krw: 0.058 },
]

/** 데모 AI 브리핑 카드 (미리 생성된 결과) */
export const DEMO_BRIEFING_SUMMARY = '이번 달 7개국 총 매출은 전월 대비 4.2% 증가했습니다. 인도와 베트남 시장이 두 자릿수 성장을 기록한 반면, 중국은 계절적 요인으로 소폭 하락했습니다.'

export const DEMO_BRIEFING_CARDS: BriefingCard[] = [
  {
    title: '매출 종합',
    content: '7개국 총 매출 전월 대비 4.2% 증가. 미국 $1.28M(+2.4%), 인도 ₹92M(+8.2%), 일본 ¥19.2M(+3.8%)이 성장을 견인. 전체적으로 안정적인 상승 추세를 유지하고 있습니다.',
  },
  {
    title: '국가별 분석',
    content: '인도가 신규 대리점 계약 효과로 +8.2% 최고 성장. 베트남도 동남아 수요 증가로 +6.5% 호조. 반면 중국은 춘절 이후 재고 조정으로 -3.1% 하락. 폴란드는 유럽 경기 둔화 영향으로 보합세.',
  },
  {
    title: '환율 영향',
    content: '원/달러 환율 1,450원대 유지. 엔화 약세(¥1=₩9.7)로 일본 법인의 원화 환산 매출이 감소 추세. 인도 루피 강세(₹1=₩17)는 인도 매출의 원화 환산에 긍정적 영향.',
  },
  {
    title: '주요 이슈',
    content: '중국 법인의 춘절 후 회복 속도가 예상보다 느림. 베트남 공장 증설 투자(Q3 가동 예정)에 따른 초기 비용 증가 예상. 폴란드 유럽 에너지 가격 상승이 원가에 영향 가능성.',
  },
  {
    title: '경쟁사 동향',
    content: '삼성전자 인도 프리미엄 라인업 확대, Bosch 폴란드 공장 증설 발표, Mitsubishi Electric 베트남 법인 설립 준비. 경쟁 심화에 대한 대응 전략 수립 필요.',
  },
  {
    title: '액션 제안',
    content: '1. 중국 법인 회복 지연 원인 분석 및 Q2 판촉 계획 수립\n2. 인도 신규 대리점 확대 효과 극대화 — 추가 3개 도시 진출 검토\n3. 엔화 약세 대비 일본 법인 가격 정책 재검토\n4. 베트남 공장 가동 전 현지 인력 교육 계획 확정',
  },
]
