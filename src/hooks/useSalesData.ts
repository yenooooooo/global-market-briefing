/**
 * hooks/useSalesData.ts — 매출 데이터 조회 커스텀 훅
 *
 * gmb_monthly_sales + gmb_countries를 조인하여
 * 국가 정보가 포함된 매출 데이터를 조회합니다.
 *
 * 사용 위치:
 * - 매출 현황 페이지 (차트, 테이블, KPI 카드)
 * - 홈 대시보드 (요약 지표)
 * - AI 브리핑 생성 (데이터 수집)
 *
 * 반환값:
 * - salesData: 국가 정보가 포함된 매출 데이터 배열
 * - countries: 등록된 국가 목록
 * - isLoading: 데이터 로딩 상태
 * - refetch: 데이터 재조회 함수
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Country, MonthlySales, SalesWithCountry } from '@/types'

/** 훅 반환 타입 */
interface UseSalesDataReturn {
  salesData: SalesWithCountry[]  // 국가 정보 포함 매출 데이터
  countries: Country[]            // 등록된 국가 목록
  isLoading: boolean              // 로딩 상태
  refetch: () => Promise<void>    // 재조회 함수
}

/**
 * 매출 데이터 조회 훅
 *
 * @param periodMonths - 조회할 기간 (최근 N개월, 기본: 12)
 * @returns 매출 데이터, 국가 목록, 로딩 상태, 재조회 함수
 */
export function useSalesData(periodMonths: number = 12): UseSalesDataReturn {
  const [salesData, setSalesData] = useState<SalesWithCountry[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Supabase에서 매출 + 국가 데이터를 조인하여 조회
   *
   * select('*, country:gmb_countries(*)') 구문으로
   * gmb_monthly_sales의 country_id를 통해 gmb_countries를 자동 조인합니다.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    /* 조회 기간 계산: 현재 달 기준 N개월 전 */
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1)
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth() + 1

    /* 1) 국가 목록 조회 */
    const { data: countriesData } = await supabase
      .from('gmb_countries')
      .select('*')
      .order('created_at', { ascending: true })

    /* 2) 매출 데이터 + 국가 정보 조인 조회 */
    const { data: salesRaw } = await supabase
      .from('gmb_monthly_sales')
      .select('*, country:gmb_countries(*)')
      .order('year', { ascending: true })
      .order('month', { ascending: true })

    setCountries(countriesData || [])

    if (salesRaw) {
      /**
       * Supabase 조인 결과를 SalesWithCountry 타입으로 변환
       * country 필드가 단일 객체(1:1 관계)로 반환됨
       */
      const formatted: SalesWithCountry[] = salesRaw
        .filter((row: Record<string, unknown>) => row.country) // country가 null인 경우 필터링
        .map((row: Record<string, unknown>) => ({
          ...(row as unknown as MonthlySales),
          country: row.country as Country,
        }))

      /* 기간 필터 적용 */
      const filtered = formatted.filter((s) => {
        if (s.year > startYear) return true
        if (s.year === startYear && s.month >= startMonth) return true
        return false
      })

      setSalesData(filtered)
    }

    setIsLoading(false)
  }, [periodMonths])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { salesData, countries, isLoading, refetch: fetchData }
}
