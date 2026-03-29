/**
 * (dashboard)/home/page.tsx — 홈 대시보드
 *
 * 로그인 후 첫 화면으로, 오늘의 핵심 지표를 한눈에 보여줍니다.
 *
 * 구성:
 * 1. 핵심 KPI 4개 카드: 이번 달 총 매출, 전월 대비, 최고 성장 국가, 데이터 건수
 * 2. 국가별 매출 미니 바 차트: 이번 달 vs 지난 달 비교
 * 3. 최근 AI 브리핑 미리보기: 가장 최근 브리핑의 요약
 * 4. 환율 스트립: 주요 통화 환율 가로 표시
 *
 * 데이터:
 * - useSalesData 훅으로 매출 데이터 조회
 * - Supabase에서 최근 브리핑, 환율 직접 조회
 */
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp, BarChart3, Database, Sparkles, ArrowRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from 'recharts'
import { useSalesData } from '@/hooks/useSalesData'
import StatCard from '@/components/shared/StatCard'
import { createClient } from '@/lib/supabase/client'
import { calcChangeRate } from '@/lib/utils/format'
import { countryCodeToFlag, CURRENCY_SYMBOLS } from '@/lib/constants/countries'
import type { Briefing, BriefingResponse } from '@/types'

/** 국가별 미니 차트 색상 */
const BAR_COLORS = ['#b7c4ff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#67e8f9']

export default function HomePage() {
  const { salesData, countries, isLoading } = useSalesData(12)
  const [latestBriefing, setLatestBriefing] = useState<Briefing | null>(null)
  const [exchangeRates, setExchangeRates] = useState<{ currency: string; rate_to_krw: number }[]>([])

  /* ── 최근 브리핑 + 환율 조회 ── */
  useEffect(() => {
    const fetchExtras = async () => {
      const supabase = createClient()

      /* 최근 브리핑 1건 */
      const { data: briefings } = await supabase
        .from('gmb_briefings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (briefings && briefings.length > 0) {
        setLatestBriefing(briefings[0])
      }

      /* 환율 (API Route 호출) */
      try {
        const res = await fetch('/api/exchange/rate')
        if (res.ok) {
          const data = await res.json()
          setExchangeRates(data.latest || [])
        }
      } catch { /* 환율 조회 실패 시 무시 */ }
    }

    fetchExtras()
  }, [])

  /**
   * KPI 계산 — 이번 달 총 매출, 전월 대비, 최고 성장 국가
   */
  const kpi = useMemo(() => {
    if (salesData.length === 0) return null

    /* 가장 최근 데이터가 있는 월을 기준으로 KPI 계산 */
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

    /* 국가별 이번 달 매출 (미니 차트용) */
    const countryData = countries.map((country, idx) => {
      const thisRev = thisMonthSales
        .filter((s) => s.country_id === country.id)
        .reduce((sum, s) => sum + s.revenue, 0)
      const prevRev = prevMonthSales
        .filter((s) => s.country_id === country.id)
        .reduce((sum, s) => sum + s.revenue, 0)

      return {
        name: country.name,
        code: country.code,
        thisMonth: thisRev,
        prevMonth: prevRev,
        change: calcChangeRate(thisRev, prevRev),
        color: BAR_COLORS[idx % BAR_COLORS.length],
      }
    }).filter((c) => c.thisMonth > 0 || c.prevMonth > 0)

    /* 최고 성장 국가 */
    const best = countryData
      .filter((c) => c.change !== null)
      .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0]

    return { totalThis, totalChange, countryData, best, dataCount: salesData.length, latestYear: thisYear, latestMonth: thisMonth }
  }, [salesData, countries])

  /** 최근 브리핑 요약 파싱 */
  const briefingSummary = useMemo(() => {
    if (!latestBriefing) return null

    let content = latestBriefing.content.trim()

    /* ```json ... ``` 블록 제거 */
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      content = jsonBlockMatch[1].trim()
    }

    try {
      const parsed: BriefingResponse = JSON.parse(content)
      return parsed.summary
    } catch {
      /* JSON 파싱 실패 시 텍스트에서 summary 부분만 추출 시도 */
      const summaryMatch = content.match(/"summary"\s*:\s*"([^"]*)"/)
      if (summaryMatch) return summaryMatch[1]
      return null
    }
  }, [latestBriefing])

  /* ── 로딩 ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">홈 대시보드</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-surface-container animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── 인사 헤더 ── */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">홈 대시보드</h1>
        <p className="mt-2 text-on-surface-variant">오늘의 핵심 지표를 확인하세요</p>
      </div>

      {/* ══════════════════════════════════════
         환율 스트립 — 주요 통화 가로 표시
         ══════════════════════════════════════ */}
      {exchangeRates.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {exchangeRates.map((rate) => (
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
      )}

      {/* ══════════════════════════════════════
         KPI 카드 4개
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={kpi ? `${kpi.latestMonth}월 총 매출` : '총 매출'}
          value={kpi ? kpi.totalThis.toLocaleString() : '—'}
          change={kpi?.totalChange}
          changeLabel="전월 대비"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          label="최고 성장 국가"
          value={kpi?.best ? `${countryCodeToFlag(kpi.best.code)} ${kpi.best.name}` : '—'}
          change={kpi?.best?.change}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="등록 데이터"
          value={kpi ? `${kpi.dataCount}건` : '0건'}
          icon={<Database size={18} />}
        />
        <StatCard
          label="AI 브리핑"
          value={latestBriefing ? '최근 생성됨' : '미생성'}
          icon={<Sparkles size={18} />}
        />
      </div>

      {/* ══════════════════════════════════════
         국가별 이번 달 매출 미니 차트
         ══════════════════════════════════════ */}
      {kpi && kpi.countryData.length > 0 && (
        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              국가별 {kpi.latestMonth}월 매출
            </h3>
            <Link href="/sales" className="flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4">
              상세 보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={Math.max(240, kpi.countryData.length * 45)}>
            <BarChart data={kpi.countryData} layout="vertical" margin={{ left: 60, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#8d90a2', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e5e2e3', fontSize: 13 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ backgroundColor: '#2a2a2b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#c3c5d9' }}
                itemStyle={{ color: '#e5e2e3' }}
                formatter={(value) => [Number(value).toLocaleString(), '매출']}
              />
              <Bar dataKey="thisMonth" radius={[0, 4, 4, 0]} barSize={20}>
                {kpi.countryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
         최근 AI 브리핑 미리보기
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">최근 AI 브리핑</h3>
          <Link href="/briefing" className="flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>

        {briefingSummary ? (
          <p className="text-on-surface-variant leading-[1.8] whitespace-pre-line">{briefingSummary}</p>
        ) : (
          <div className="py-8 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-outline" />
            <p className="text-on-surface-variant text-sm">아직 생성된 브리핑이 없습니다</p>
            <Link href="/briefing" className="mt-3 inline-block text-sm text-primary hover:underline underline-offset-4">
              첫 AI 브리핑 생성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
