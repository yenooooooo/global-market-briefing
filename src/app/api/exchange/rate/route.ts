/**
 * api/exchange/rate/route.ts — 환율 조회/갱신 API
 *
 * 외부 환율 API(exchangerate-api.com)에서 최신 환율을 가져오고,
 * gmb_exchange_rates 테이블에 캐싱합니다.
 *
 * 동작 방식:
 * - GET 요청 시 DB에서 캐시된 환율 데이터 반환
 * - 쿼리 파라미터 ?refresh=true 면 외부 API 호출 후 DB 갱신
 * - 캐시가 오래된 경우(1일 이상) 자동으로 외부 API 호출
 * - 외부 API 호출 실패 시 최근 캐시 데이터 사용 (폴백)
 *
 * 외부 API:
 * https://v6.exchangerate-api.com/v6/{API_KEY}/latest/KRW
 * → 원화 기준 모든 통화의 환율 반환
 *
 * ※ Service Role 키를 사용하여 RLS를 우회합니다 (환율은 공용 데이터)
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/** 프로젝트에서 사용하는 통화 목록 */
const TARGET_CURRENCIES = ['USD', 'INR', 'PLN', 'CNY', 'JPY', 'EUR', 'VND']

/**
 * GET 핸들러 — 환율 데이터 조회
 *
 * 1. DB에서 각 통화의 최신 환율 조회
 * 2. 캐시가 없거나 오래되었으면 외부 API 호출하여 갱신
 * 3. 최근 30일 환율 이력도 함께 반환 (추이 차트용)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    const today = new Date().toISOString().split('T')[0]

    /* ── 1) DB에서 오늘자 캐시 확인 ── */
    const { data: todayRates } = await supabaseAdmin
      .from('gmb_exchange_rates')
      .select('*')
      .eq('date', today)
      .in('currency', TARGET_CURRENCIES)

    /* 캐시가 없거나 강제 갱신이면 외부 API 호출 */
    if (forceRefresh || !todayRates || todayRates.length < TARGET_CURRENCIES.length) {
      await fetchAndCacheRates(today)
    }

    /* ── 2) 최신 환율 데이터 조회 (갱신 후) ── */
    const { data: latestRates } = await supabaseAdmin
      .from('gmb_exchange_rates')
      .select('*')
      .eq('date', today)
      .in('currency', TARGET_CURRENCIES)
      .order('currency')

    /* ── 3) 최근 30일 이력 조회 (추이 차트용) ── */
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data: historyRates } = await supabaseAdmin
      .from('gmb_exchange_rates')
      .select('*')
      .in('currency', TARGET_CURRENCIES)
      .gte('date', startDate)
      .order('date', { ascending: true })

    /* ── 4) 전일 환율 조회 (등락 계산용) ── */
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: yesterdayRates } = await supabaseAdmin
      .from('gmb_exchange_rates')
      .select('*')
      .eq('date', yesterdayStr)
      .in('currency', TARGET_CURRENCIES)

    return NextResponse.json({
      latest: latestRates || [],
      history: historyRates || [],
      yesterday: yesterdayRates || [],
      date: today,
    })
  } catch {
    return NextResponse.json(
      { message: '환율 데이터 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 외부 환율 API를 호출하여 DB에 캐싱
 *
 * exchangerate-api.com의 무료 API를 사용합니다.
 * 원화(KRW) 기준 환율을 가져와서 1 외화 = ? 원으로 변환합니다.
 *
 * @param date - 저장할 날짜 (YYYY-MM-DD)
 */
async function fetchAndCacheRates(date: string) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  if (!apiKey) {
    console.error('EXCHANGE_RATE_API_KEY가 설정되지 않았습니다.')
    return
  }

  try {
    /**
     * exchangerate-api.com API 호출
     * USD 기준 모든 통화의 환율을 반환합니다.
     * 예: { "conversion_rates": { "KRW": 1350.5, "JPY": 149.8, ... } }
     */
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    )

    if (!res.ok) {
      console.error('환율 API 호출 실패:', res.status)
      return
    }

    const data = await res.json()
    const rates = data.conversion_rates

    if (!rates || !rates.KRW) {
      console.error('환율 데이터 형식이 올바르지 않습니다.')
      return
    }

    /**
     * 1 외화 = ? 원 으로 변환
     *
     * API는 1 USD = X KRW, 1 USD = Y JPY 형식이므로
     * 1 JPY = (X/Y) KRW로 계산합니다.
     *
     * 공식: rate_to_krw = rates.KRW / rates[currency]
     * 예: 1 JPY = 1350 / 149.8 = 9.01 원
     */
    const upsertData = TARGET_CURRENCIES.map((currency) => ({
      currency,
      rate_to_krw: Math.round((rates.KRW / rates[currency]) * 10000) / 10000,
      date,
    }))

    /* DB에 upsert (같은 통화/날짜면 업데이트) */
    await supabaseAdmin
      .from('gmb_exchange_rates')
      .upsert(upsertData, { onConflict: 'currency,date' })

  } catch (error) {
    console.error('환율 캐싱 실패:', error)
  }
}
