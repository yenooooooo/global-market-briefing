/**
 * api/demo/seed/route.ts — 데모 데이터 시딩 API
 *
 * 7개국 프리셋 + 12개월 매출 데이터 + 경쟁사 메모 3개를 자동 생성합니다.
 * 회원가입 후 "데모 데이터로 시작하기" 버튼에서 호출됩니다.
 *
 * 생성되는 데이터:
 * - 7개국: 미국, 인도, 폴란드, 중국, 일본, 독일, 베트남
 * - 12개월 매출: 국가별 현실적 금액 범위 + 약간의 트렌드
 * - 경쟁사 메모 3개: 삼성, 보쉬, 미쓰비시
 *
 * ※ 이미 데이터가 있으면 중복 생성하지 않습니다.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRESET_COUNTRIES } from '@/lib/constants/countries'

/**
 * 국가별 월 매출 범위 — 현실적인 금액으로 설정
 * base: 기본 매출, variance: 변동 폭 (±)
 */
const REVENUE_RANGES: Record<string, { base: number; variance: number }> = {
  US: { base: 1_250_000, variance: 200_000 },       // USD — 약 100~150만 달러
  IN: { base: 85_000_000, variance: 15_000_000 },   // INR — 약 7천~1억 루피
  PL: { base: 420_000, variance: 80_000 },           // PLN — 약 35~50만 즈워티
  CN: { base: 3_200_000, variance: 600_000 },        // CNY — 약 260~380만 위안
  JP: { base: 18_500_000, variance: 3_000_000 },     // JPY — 약 1550~2150만 엔
  DE: { base: 380_000, variance: 60_000 },           // EUR — 약 32~44만 유로
  VN: { base: 2_800_000_000, variance: 500_000_000 },// VND — 약 23~33억 동
}

/** 간단한 트렌드 적용 — 월이 지남에 따라 약간 성장 */
function generateRevenue(code: string, monthIndex: number): number {
  const range = REVENUE_RANGES[code] || { base: 1_000_000, variance: 200_000 }
  const trend = 1 + monthIndex * 0.01  // 월 1% 성장 트렌드
  const random = (Math.random() - 0.5) * 2 * range.variance  // 랜덤 변동
  return Math.round((range.base * trend + random) * 100) / 100
}

/** 랜덤 정수 생성 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST() {
  try {
    const supabase = await createClient()

    /* 현재 로그인 사용자 확인 */
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    /* ── 1) 이미 국가가 있는지 확인 ── */
    const { data: existingCountries } = await supabase
      .from('gmb_countries')
      .select('id')
      .limit(1)

    if (existingCountries && existingCountries.length > 0) {
      return NextResponse.json({ message: '이미 데이터가 존재합니다.', skipped: true })
    }

    /* ── 2) 7개국 프리셋 생성 ── */
    const { data: countries, error: countryError } = await supabase
      .from('gmb_countries')
      .insert(
        PRESET_COUNTRIES.map((c) => ({
          user_id: user.id,
          name: c.name,
          code: c.code,
          currency: c.currency,
        }))
      )
      .select()

    if (countryError || !countries) {
      return NextResponse.json({ message: '국가 생성 실패' }, { status: 500 })
    }

    /* ── 3) 12개월 매출 데이터 생성 ── */
    const now = new Date()
    const salesData: Array<Record<string, unknown>> = []

    countries.forEach((country) => {
      for (let i = 11; i >= 0; i--) {
        /* 최근 12개월 역순으로 생성 */
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const monthIndex = 11 - i  // 0~11 (성장 트렌드용)

        salesData.push({
          user_id: user.id,
          country_id: country.id,
          year,
          month,
          revenue: generateRevenue(country.code, monthIndex),
          orders: randomInt(10, 80),
          new_customers: randomInt(2, 30),
          memo: monthIndex === 0 ? '시딩 데이터' : null,
        })
      }
    })

    const { error: salesError } = await supabase
      .from('gmb_monthly_sales')
      .insert(salesData)

    if (salesError) {
      console.error('매출 데이터 시딩 실패:', salesError)
    }

    /* ── 4) 경쟁사 메모 3개 생성 ── */
    const competitorNotes = [
      {
        user_id: user.id,
        competitor_name: '삼성전자',
        note: '2025년 1분기 글로벌 가전 매출 전년 대비 12% 증가. 특히 인도/동남아 시장에서 프리미엄 라인업 확대.',
        source: null,
      },
      {
        user_id: user.id,
        competitor_name: 'Bosch',
        note: '유럽 시장에서 에너지 효율 제품 라인업 강화. 폴란드 공장 증설 계획 발표. 2025년 하반기 가동 예정.',
        source: null,
      },
      {
        user_id: user.id,
        competitor_name: 'Mitsubishi Electric',
        note: '일본 내수 시장 침체로 해외 비중 확대 전략. 베트남 신규 법인 설립 준비 중.',
        source: null,
      },
    ]

    await supabase.from('gmb_competitor_notes').insert(competitorNotes)

    return NextResponse.json({
      message: '데모 데이터가 성공적으로 생성되었습니다.',
      created: {
        countries: countries.length,
        sales: salesData.length,
        competitors: competitorNotes.length,
      },
    })
  } catch {
    return NextResponse.json({ message: '데모 데이터 생성 중 오류 발생' }, { status: 500 })
  }
}
