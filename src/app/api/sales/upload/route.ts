/**
 * api/sales/upload/route.ts — CSV 매출 데이터 업로드 API
 *
 * 클라이언트에서 파싱된 CSV 데이터를 받아 gmb_monthly_sales 테이블에 저장합니다.
 *
 * 처리 과정:
 * 1. 파싱된 CSV 데이터 배열 수신 (JSON body)
 * 2. 국가명으로 gmb_countries에서 country_id 매핑
 * 3. gmb_monthly_sales에 upsert (중복 시 덮어쓰기)
 * 4. 성공/실패 건수 반환
 *
 * 요청 형식:
 * POST /api/sales/upload
 * Body: { rows: [{ country, year, month, revenue, orders?, new_customers?, memo? }] }
 *
 * 응답 형식:
 * { success: number, failed: number, errors: string[] }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CSVSalesRow } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    /* 현재 로그인 사용자 확인 */
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    /* 요청 바디 파싱 */
    const { rows } = (await request.json()) as { rows: CSVSalesRow[] }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: '업로드할 데이터가 없습니다.' },
        { status: 400 }
      )
    }

    /* 사용자의 국가 목록 조회 — 국가명 → country_id 매핑용 */
    const { data: countries } = await supabase
      .from('gmb_countries')
      .select('id, name, code')

    if (!countries || countries.length === 0) {
      return NextResponse.json(
        { message: '등록된 국가가 없습니다. 먼저 설정에서 국가를 추가해주세요.' },
        { status: 400 }
      )
    }

    /* 국가명 → ID 매핑 테이블 생성 */
    const countryMap = new Map<string, string>()
    countries.forEach((c) => {
      countryMap.set(c.name, c.id)         // 한글명 매핑 (예: '미국' → uuid)
      countryMap.set(c.code, c.id)         // 코드 매핑 (예: 'US' → uuid)
    })

    let success = 0
    let failed = 0
    const errors: string[] = []

    /* 각 행을 순회하며 upsert */
    for (const row of rows) {
      /* 국가명 또는 코드로 country_id 조회 */
      const countryId = countryMap.get(row.country)
      if (!countryId) {
        errors.push(`'${row.country}' 국가를 찾을 수 없습니다.`)
        failed++
        continue
      }

      /* gmb_monthly_sales에 upsert */
      const { error } = await supabase
        .from('gmb_monthly_sales')
        .upsert(
          {
            user_id: user.id,
            country_id: countryId,
            year: row.year,
            month: row.month,
            revenue: row.revenue,
            orders: row.orders || null,
            new_customers: row.new_customers || null,
            memo: row.memo || null,
          },
          { onConflict: 'user_id,country_id,year,month' }
        )

      if (error) {
        errors.push(`${row.country} ${row.year}년 ${row.month}월: ${error.message}`)
        failed++
      } else {
        success++
      }
    }

    return NextResponse.json({ success, failed, errors })
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
