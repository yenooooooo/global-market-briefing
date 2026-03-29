/**
 * demo/page.tsx — 포트폴리오 시연용 데모 페이지
 *
 * 로그인 없이 대시보드의 핵심 기능을 체험할 수 있습니다.
 * 하드코딩된 데모 데이터를 사용하여 실제와 동일한 UI를 보여줍니다.
 *
 * 구성:
 * 1. 환율 스트립
 * 2. KPI 카드 4개
 * 3. 매출 차트 (Recharts BarChart)
 * 4. 매출 테이블
 * 5. AI 브리핑 (생성 버튼 + 6장 카드)
 */
'use client'

import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Database, Sparkles } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import SalesChart from '@/components/sales/SalesChart'
import SalesTable from '@/components/sales/SalesTable'
import BriefingCards from '@/components/briefing/BriefingCards'
import {
  generateDemoSales,
  DEMO_COUNTRIES,
  DEMO_EXCHANGE_RATES,
  DEMO_BRIEFING_CARDS,
  DEMO_BRIEFING_SUMMARY,
} from '@/lib/constants/demoData'
import { calcChangeRate } from '@/lib/utils/format'
import { countryCodeToFlag, CURRENCY_SYMBOLS } from '@/lib/constants/countries'

export default function DemoPage() {
  /* ── 데모 데이터 생성 (한 번만) ── */
  const salesData = useMemo(() => generateDemoSales(), [])

  /* ── AI 브리핑 상태 ── */
  const [showBriefing, setShowBriefing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  /* ── KPI 계산 ── */
  const kpi = useMemo(() => {
    const latestSale = [...salesData].sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month
    )[0]

    const thisYear = latestSale.year
    const thisMonth = latestSale.month
    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1
    const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear

    const thisMonthSales = salesData.filter((s) => s.year === thisYear && s.month === thisMonth)
    const prevMonthSales = salesData.filter((s) => s.year === prevYear && s.month === prevMonth)

    const totalThis = thisMonthSales.reduce((sum, s) => sum + s.revenue, 0)
    const totalPrev = prevMonthSales.reduce((sum, s) => sum + s.revenue, 0)
    const totalChange = calcChangeRate(totalThis, totalPrev)

    const best = DEMO_COUNTRIES.map((country) => {
      const thisRev = thisMonthSales.filter((s) => s.country_id === country.id).reduce((sum, s) => sum + s.revenue, 0)
      const prevRev = prevMonthSales.filter((s) => s.country_id === country.id).reduce((sum, s) => sum + s.revenue, 0)
      return { country, change: calcChangeRate(thisRev, prevRev) }
    }).filter((c) => c.change !== null).sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0]

    return { totalThis, totalChange, best, latestMonth: thisMonth, dataCount: salesData.length }
  }, [salesData])

  /** AI 브리핑 생성 시뮬레이션 */
  const handleGenerateBriefing = () => {
    setIsGenerating(true)
    setShowBriefing(false)
    /* 2초 후 결과 표시 (실제 API 호출 없이 시뮬레이션) */
    setTimeout(() => {
      setIsGenerating(false)
      setShowBriefing(true)
    }, 2000)
  }

  return (
    <div className="space-y-8">

      {/* ═══════════════ 환율 스트립 ═══════════════ */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {DEMO_EXCHANGE_RATES.map((rate) => (
          <div key={rate.currency} className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 shrink-0">
            <span className="text-xs font-label font-bold text-on-surface-variant">{rate.currency}</span>
            <span className="font-headline text-sm font-bold text-on-surface">
              {CURRENCY_SYMBOLS[rate.currency]}1 = ₩{rate.rate_to_krw < 1
                ? rate.rate_to_krw.toFixed(2)
                : rate.rate_to_krw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>

      {/* ═══════════════ KPI 카드 ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`${kpi.latestMonth}월 총 매출`}
          value={kpi.totalThis.toLocaleString()}
          change={kpi.totalChange}
          changeLabel="전월 대비"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          label="최고 성장 국가"
          value={kpi.best ? `${countryCodeToFlag(kpi.best.country.code)} ${kpi.best.country.name}` : '—'}
          change={kpi.best?.change}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="등록 데이터"
          value={`${kpi.dataCount}건`}
          icon={<Database size={18} />}
        />
        <StatCard
          label="AI 브리핑"
          value={showBriefing ? '생성 완료' : '미생성'}
          icon={<Sparkles size={18} />}
        />
      </div>

      {/* ═══════════════ 매출 차트 ═══════════════ */}
      <div id="sales">
        <SalesChart salesData={salesData} countries={DEMO_COUNTRIES} />
      </div>

      {/* ═══════════════ 매출 테이블 ═══════════════ */}
      <SalesTable salesData={salesData} countries={DEMO_COUNTRIES} />

      {/* ═══════════════ AI 브리핑 ═══════════════ */}
      <div id="briefing" className="space-y-6">
        {/* 생성 버튼 */}
        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">AI 경영 브리핑</h2>
              <p className="text-sm text-on-surface-variant">매출 데이터를 분석하여 인사이트를 생성합니다</p>
            </div>
          </div>
          <button
            onClick={handleGenerateBriefing}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 btn-primary-glow px-8 py-4 rounded-full font-headline font-bold text-base tracking-tight disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Sparkles size={20} />
            {isGenerating ? 'AI가 분석 중입니다...' : 'AI 브리핑 생성 (데모)'}
          </button>
        </div>

        {/* 생성 중 애니메이션 */}
        {isGenerating && (
          <div className="rounded-xl bg-surface-container p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">AI 분석 중</span>
            </div>
            <p className="text-on-surface leading-relaxed text-base">
              매출 데이터를 분석하고 있습니다...
              <span className="animate-pulse text-primary ml-1">▌</span>
            </p>
          </div>
        )}

        {/* 브리핑 카드 표시 */}
        {showBriefing && (
          <BriefingCards cards={DEMO_BRIEFING_CARDS} summary={DEMO_BRIEFING_SUMMARY} />
        )}
      </div>

      {/* ═══════════════ 환율 카드 ═══════════════ */}
      <div id="exchange">
        <div className="rounded-xl bg-surface-container p-6">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-6">환율 현황</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DEMO_EXCHANGE_RATES.map((rate) => (
              <div key={rate.currency} className="rounded-xl bg-surface-container-high p-4">
                <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                  {rate.currency}
                </span>
                <p className="font-headline text-lg font-bold text-on-surface">
                  ₩{rate.rate_to_krw < 1
                    ? rate.rate_to_krw.toFixed(2)
                    : rate.rate_to_krw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
