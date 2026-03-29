/**
 * (dashboard)/exchange/page.tsx — 환율 현황 페이지
 *
 * 등록된 국가의 통화별 환율 정보를 표시하는 페이지입니다.
 *
 * 구성:
 * 1. 통화별 환율 테이블: 현재 환율 + 전일 대비 등락
 * 2. 30일 추이 라인 차트 (선택된 통화)
 * 3. 간단 환산 계산기: 금액 입력 → 원화 변환
 *
 * 데이터:
 * - /api/exchange/rate API에서 최신 + 30일 이력 조회
 * - DB에 캐싱된 데이터 사용, 필요 시 자동 갱신
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ArrowRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { CURRENCY_SYMBOLS } from '@/lib/constants/countries'
import { formatPercent } from '@/lib/utils/format'

/** 환율 API 응답 타입 */
interface ExchangeRateItem {
  id: string
  currency: string
  rate_to_krw: number
  date: string
}

interface ExchangeData {
  latest: ExchangeRateItem[]
  history: ExchangeRateItem[]
  yesterday: ExchangeRateItem[]
  date: string
}

export default function ExchangePage() {
  const [data, setData] = useState<ExchangeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /* ── 차트에 표시할 선택된 통화 ── */
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  /* ── 환산 계산기 상태 ── */
  const [calcAmount, setCalcAmount] = useState('')
  const [calcCurrency, setCalcCurrency] = useState('USD')

  /**
   * 환율 데이터 조회
   * @param refresh - true이면 외부 API에서 강제 갱신
   */
  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const res = await fetch(`/api/exchange/rate${refresh ? '?refresh=true' : ''}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      console.error('환율 데이터 조회 실패')
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * 전일 대비 등락 계산
   * @param currency - 통화 코드
   * @returns 등락률 (%) 또는 null
   */
  const getChange = (currency: string): number | null => {
    if (!data) return null
    const today = data.latest.find((r) => r.currency === currency)
    const yesterday = data.yesterday.find((r) => r.currency === currency)
    if (!today || !yesterday || yesterday.rate_to_krw === 0) return null
    return ((today.rate_to_krw - yesterday.rate_to_krw) / yesterday.rate_to_krw) * 100
  }

  /** 선택된 통화의 30일 차트 데이터 */
  const chartData = data?.history
    .filter((r) => r.currency === selectedCurrency)
    .map((r) => ({
      date: r.date.slice(5),  // 'MM-DD' 형식
      rate: r.rate_to_krw,
    })) || []

  /** 환산 결과 계산 */
  const calcResult = (() => {
    if (!calcAmount || !data) return null
    const rate = data.latest.find((r) => r.currency === calcCurrency)
    if (!rate) return null
    return parseFloat(calcAmount) * rate.rate_to_krw
  })()

  /* ── 로딩 ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">환율 현황</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── 헤더 + 새로고침 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">환율 현황</h1>
          <p className="mt-2 text-on-surface-variant">
            주요 통화의 원화 환율을 확인하세요
            {data && <span className="ml-2 text-xs text-outline">({data.date} 기준)</span>}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-bright transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          갱신
        </button>
      </div>

      {/* ══════════════════════════════════════
         통화별 환율 테이블
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data?.latest.map((rate) => {
          const change = getChange(rate.currency)
          const isSelected = selectedCurrency === rate.currency
          return (
            <button
              key={rate.currency}
              onClick={() => setSelectedCurrency(rate.currency)}
              className={`rounded-xl p-4 text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 ring-1 ring-primary/30'
                  : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              {/* 통화 코드 + 기호 */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">
                  {rate.currency}
                </span>
                <span className="text-sm text-outline">
                  {CURRENCY_SYMBOLS[rate.currency] || ''}
                </span>
              </div>
              {/* 환율 (1 외화 = ? 원) */}
              <p className="font-headline text-xl font-bold text-on-surface">
                ₩{rate.rate_to_krw.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              {/* 전일 대비 등락 */}
              {change !== null && (
                <span className={`text-xs font-medium ${
                  change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-outline'
                }`}>
                  {formatPercent(change)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════
         30일 추이 차트
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
          {selectedCurrency}/KRW 30일 추이
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          1 {selectedCurrency} = ₩{data?.latest.find((r) => r.currency === selectedCurrency)?.rate_to_krw.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '—'}
        </p>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              {/* 라인 아래 그라데이션 채우기 정의 */}
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b7c4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#b7c4ff" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(67,70,86,0.15)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#8d90a2', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#8d90a2', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(v) => `₩${Number(v).toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2a2a2b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: '#c3c5d9', marginBottom: '4px' }}
                itemStyle={{ color: '#e5e2e3', fontWeight: 'bold' }}
                formatter={(value) => [`₩${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, selectedCurrency]}
                cursor={{ stroke: '#b7c4ff', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#b7c4ff"
                strokeWidth={2}
                fill="url(#rateGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#b7c4ff', stroke: '#131314', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-on-surface-variant text-sm">차트 데이터가 없습니다</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
         환산 계산기
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-6">환산 계산기</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_auto_1fr] items-end gap-4">
          {/* 금액 입력 */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              금액
            </label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              placeholder="1,000"
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface font-headline text-xl font-bold focus:ring-0 focus:border-primary transition-colors"
            />
          </div>

          {/* 통화 선택 */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              통화
            </label>
            <select
              value={calcCurrency}
              onChange={(e) => setCalcCurrency(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface text-sm focus:ring-0 focus:border-primary transition-colors appearance-none"
            >
              {TARGET_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-surface-container">{c}</option>
              ))}
            </select>
          </div>

          {/* 화살표 */}
          <ArrowRight size={20} className="text-outline mb-2 hidden md:block" />

          {/* 결과 */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              원화 (KRW)
            </label>
            <p className="font-headline text-xl font-bold text-primary py-2 border-b border-transparent">
              {calcResult !== null ? `₩${Math.round(calcResult).toLocaleString()}` : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 통화 목록 (컴포넌트 외부 상수) */
const TARGET_CURRENCIES = ['USD', 'INR', 'PLN', 'CNY', 'JPY', 'EUR', 'VND']
