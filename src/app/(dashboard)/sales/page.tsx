/**
 * (dashboard)/sales/page.tsx — 매출 현황 페이지
 *
 * 국가별 매출 데이터를 KPI 카드, 차트, 테이블로 시각화하는 핵심 페이지입니다.
 *
 * 구성:
 * 1. KPI 카드 4개: 총 매출, 전월 대비, 최고 성장 국가, 최저 성장 국가
 * 2. 월별 매출 추이 차트 (Recharts BarChart — 스택형)
 * 3. 국가×월 매트릭스 테이블
 *
 * 데이터 소스:
 * - useSalesData 훅으로 gmb_monthly_sales + gmb_countries 조인 조회
 * - RLS에 의해 현재 사용자의 데이터만 반환
 */
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Upload } from 'lucide-react'
import { useSalesData } from '@/hooks/useSalesData'
import StatCard from '@/components/shared/StatCard'
import SalesChart from '@/components/sales/SalesChart'
import SalesTable from '@/components/sales/SalesTable'
import { calcChangeRate } from '@/lib/utils/format'

export default function SalesPage() {
  const { salesData, countries, isLoading } = useSalesData(12)

  /**
   * KPI 데이터 계산
   *
   * 이번 달과 지난 달의 매출을 비교하여 4개 핵심 지표를 산출합니다.
   * - 총 매출: 이번 달 전체 국가 매출 합계 (현지 통화 기준)
   * - 전월 대비: 이번 달 vs 지난 달 총 매출 변화율
   * - 최고 성장 국가: 전월 대비 매출 증가율이 가장 높은 국가
   * - 최저 성장 국가: 전월 대비 매출 증가율이 가장 낮은 국가
   */
  const kpiData = useMemo(() => {
    if (salesData.length === 0) return null

    /*
     * 가장 최근 데이터가 있는 월을 기준으로 KPI 계산
     * (이번 달에 데이터가 없을 수 있으므로, 데이터가 있는 최신 월 사용)
     */
    const latestSale = [...salesData].sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month
    )[0]

    const thisYear = latestSale.year
    const thisMonth = latestSale.month
    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1
    const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear

    /* 최신 월 / 그 전달 매출 필터링 */
    const thisMonthSales = salesData.filter((s) => s.year === thisYear && s.month === thisMonth)
    const prevMonthSales = salesData.filter((s) => s.year === prevYear && s.month === prevMonth)

    /* 총 매출 합계 */
    const totalThis = thisMonthSales.reduce((sum, s) => sum + s.revenue, 0)
    const totalPrev = prevMonthSales.reduce((sum, s) => sum + s.revenue, 0)
    const totalChange = calcChangeRate(totalThis, totalPrev)

    /* 국가별 증감률 계산 */
    const countryChanges = countries.map((country) => {
      const thisRev = thisMonthSales
        .filter((s) => s.country_id === country.id)
        .reduce((sum, s) => sum + s.revenue, 0)
      const prevRev = prevMonthSales
        .filter((s) => s.country_id === country.id)
        .reduce((sum, s) => sum + s.revenue, 0)

      return {
        country,
        thisRev,
        prevRev,
        change: calcChangeRate(thisRev, prevRev),
      }
    }).filter((c) => c.change !== null)

    /* 최고/최저 성장 국가 */
    const sorted = [...countryChanges].sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
    const best = sorted[0] || null
    const worst = sorted[sorted.length - 1] || null

    return { totalThis, totalChange, best, worst }
  }, [salesData, countries])

  /* ── 로딩 스켈레톤 ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">매출 현황</h1>
          <p className="mt-2 text-on-surface-variant">데이터를 불러오는 중...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-surface-container animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── 페이지 헤더 + 데이터 입력 버튼 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">매출 현황</h1>
          <p className="mt-2 text-on-surface-variant">국가별 매출 데이터를 차트와 테이블로 확인하세요</p>
        </div>
        <Link
          href="/sales/upload"
          className="flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-2.5 text-sm font-medium text-on-surface transition-all hover:bg-surface-bright"
        >
          <Upload size={16} />
          데이터 입력
        </Link>
      </div>

      {/* ══════════════════════════════════════
         KPI 카드 4개
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="총 매출 (현지통화)"
          value={kpiData ? kpiData.totalThis.toLocaleString() : '—'}
          change={kpiData?.totalChange}
          changeLabel="전월 대비"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="전월 대비"
          value={kpiData?.totalChange !== null && kpiData?.totalChange !== undefined
            ? `${kpiData.totalChange > 0 ? '+' : ''}${kpiData.totalChange.toFixed(1)}%`
            : '—'
          }
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          label="최고 성장 국가"
          value={kpiData?.best ? kpiData.best.country.name : '—'}
          change={kpiData?.best?.change}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="최저 성장 국가"
          value={kpiData?.worst ? kpiData.worst.country.name : '—'}
          change={kpiData?.worst?.change}
          icon={<TrendingDown size={18} />}
        />
      </div>

      {/* ══════════════════════════════════════
         월별 매출 추이 차트
         ══════════════════════════════════════ */}
      <SalesChart salesData={salesData} countries={countries} />

      {/* ══════════════════════════════════════
         국가×월 매트릭스 테이블
         ══════════════════════════════════════ */}
      <SalesTable salesData={salesData} countries={countries} />
    </div>
  )
}
