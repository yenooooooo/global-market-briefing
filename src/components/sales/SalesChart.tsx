/**
 * components/sales/SalesChart.tsx — 월별 매출 추이 차트
 *
 * Recharts BarChart를 사용하여 국가별 월별 매출 추이를 시각화합니다.
 *
 * 기능:
 * - X축: 월 (최근 12개월)
 * - Y축: 매출 금액
 * - 국가별 색상 구분 (스택형 바 차트)
 * - 호버 시 툴팁: 국가명, 금액
 *
 * 디자인:
 * - 다크 테마에 맞는 차트 컬러 (밝은 색상)
 * - surface-container 배경 카드
 * - 축/그리드 라인은 outline-variant 15%로 미묘하게
 */
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { SalesWithCountry, Country } from '@/types'

/** 국가별 차트 색상 — 다크 배경에서 잘 보이는 밝은 색상 */
const CHART_COLORS = [
  '#b7c4ff',   // primary — 블루
  '#4ade80',   // success — 초록
  '#fbbf24',   // warning — 노랑
  '#f87171',   // danger — 빨강
  '#a78bfa',   // 보라
  '#fb923c',   // 주황
  '#67e8f9',   // 시안
]

interface SalesChartProps {
  salesData: SalesWithCountry[]  // 매출 데이터 (국가 정보 포함)
  countries: Country[]           // 등록된 국가 목록
}

/**
 * 매출 데이터를 Recharts가 요구하는 형식으로 변환
 *
 * 입력: [{ year: 2025, month: 1, country: { name: '미국' }, revenue: 1250000 }, ...]
 * 출력: [{ label: '25.01', '미국': 1250000, '인도': 85000000, ... }, ...]
 *
 * @param salesData - 원본 매출 데이터
 * @param countries - 국가 목록
 * @returns Recharts용 변환 데이터
 */
function transformChartData(salesData: SalesWithCountry[], countries: Country[]) {
  /* 연도-월 기준으로 그룹핑 */
  const grouped = new Map<string, Record<string, string | number>>()

  salesData.forEach((sale) => {
    /* 라벨: '25.01' 형식 */
    const label = `${String(sale.year).slice(2)}.${String(sale.month).padStart(2, '0')}`

    if (!grouped.has(label)) {
      grouped.set(label, { label })
    }

    const entry = grouped.get(label)!
    /* 국가명을 키로 사용하여 매출 저장 */
    entry[sale.country.name] = sale.revenue
  })

  /* Map → 배열 변환, 날짜순 정렬 */
  return Array.from(grouped.values()).sort((a, b) =>
    String(a.label).localeCompare(String(b.label))
  )
}

/**
 * Recharts 커스텀 툴팁 — 다크 테마 스타일
 */
function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload) return null
  const items = payload as Array<{ name: string; value: number; color: string }>

  return (
    <div className="rounded-lg bg-surface-container-high p-3 shadow-[var(--shadow-ambient)]">
      <p className="text-xs text-on-surface-variant mb-2 font-label">{String(label)}</p>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-on-surface-variant">{item.name}</span>
          </span>
          <span className="font-headline font-bold text-on-surface">
            {Number(item.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SalesChart({ salesData, countries }: SalesChartProps) {
  const chartData = transformChartData(salesData, countries)

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">월별 매출 추이</h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-on-surface-variant text-sm">매출 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-surface-container p-6 overflow-hidden">
      <h3 className="font-headline text-lg font-bold text-on-surface mb-6">월별 매출 추이</h3>
      <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {/* 그리드 라인 — Ghost Border 스타일 */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(67, 70, 86, 0.15)"
            vertical={false}
          />

          {/* X축: 월 */}
          <XAxis
            dataKey="label"
            tick={{ fill: '#8d90a2', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(67, 70, 86, 0.15)' }}
            tickLine={false}
          />

          {/* Y축: 매출 */}
          <YAxis
            tick={{ fill: '#8d90a2', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
              return v
            }}
          />

          {/* 툴팁 */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(67, 70, 86, 0.1)' }} />

          {/* 범례 */}
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(value) => <span className="text-on-surface-variant">{value}</span>}
          />

          {/* 국가별 바 — 스택형 */}
          {countries.map((country, idx) => (
            <Bar
              key={country.id}
              dataKey={country.name}
              stackId="sales"
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              radius={idx === countries.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      </div>
      </div>
    </div>
  )
}
