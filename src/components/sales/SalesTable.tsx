/**
 * components/sales/SalesTable.tsx — 국가×월 매출 매트릭스 테이블
 *
 * 국가별 월별 매출을 매트릭스 형태로 표시하는 테이블입니다.
 *
 * 구조:
 * ┌────────┬─────────┬─────────┬─────────┬───┐
 * │ 국가   │ 25.01   │ 25.02   │ 25.03   │...│
 * ├────────┼─────────┼─────────┼─────────┼───┤
 * │ 🇺🇸 미국│ 1,250K  │ 1,300K  │ 1,180K  │   │
 * │ 🇮🇳 인도│ 85,000K │ 92,000K │ 78,000K │   │
 * └────────┴─────────┴─────────┴─────────┴───┘
 *
 * 디자인:
 * - No-Line 룰 적용 — 교대 배경색으로 행 구분
 * - surface-container / surface-container-high 교대
 * - 호버 시 행 하이라이트
 * - 숫자는 font-headline 우측 정렬
 */
'use client'

import type { SalesWithCountry, Country } from '@/types'
import { countryCodeToFlag } from '@/lib/constants/countries'

interface SalesTableProps {
  salesData: SalesWithCountry[]
  countries: Country[]
}

/**
 * 고유한 연도-월 조합을 추출하여 정렬된 컬럼 헤더를 생성
 *
 * @param salesData - 매출 데이터
 * @returns [{ year: 2025, month: 1, label: '25.01' }, ...] 정렬된 배열
 */
function getMonthColumns(salesData: SalesWithCountry[]) {
  const monthSet = new Set<string>()
  salesData.forEach((s) => {
    monthSet.add(`${s.year}-${String(s.month).padStart(2, '0')}`)
  })

  return Array.from(monthSet)
    .sort()
    .map((key) => {
      const [year, month] = key.split('-')
      return {
        year: parseInt(year),
        month: parseInt(month),
        label: `${year.slice(2)}.${month}`,
      }
    })
}

/**
 * 특정 국가/연도/월의 매출 데이터를 찾아 반환
 */
function findSales(
  salesData: SalesWithCountry[],
  countryId: string,
  year: number,
  month: number
): SalesWithCountry | undefined {
  return salesData.find(
    (s) => s.country_id === countryId && s.year === year && s.month === month
  )
}

export default function SalesTable({ salesData, countries }: SalesTableProps) {
  const columns = getMonthColumns(salesData)

  if (columns.length === 0 || countries.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">매출 상세 테이블</h3>
        <div className="flex h-32 items-center justify-center">
          <p className="text-on-surface-variant text-sm">매출 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-surface-container p-6">
      <h3 className="font-headline text-lg font-bold text-on-surface mb-6">매출 상세 테이블</h3>

      {/* 가로 스크롤 가능한 테이블 래퍼 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* ── 테이블 헤더 ── */}
          <thead>
            <tr>
              {/* 국가 컬럼 (고정) */}
              <th className="sticky left-0 z-10 bg-surface-container px-4 py-3 text-left text-xs uppercase tracking-widest text-on-surface-variant font-label font-medium">
                국가
              </th>
              {/* 월별 컬럼 */}
              {columns.map((col) => (
                <th
                  key={col.label}
                  className="px-4 py-3 text-right text-xs uppercase tracking-widest text-on-surface-variant font-label font-medium whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── 테이블 바디 ── */}
          <tbody>
            {countries.map((country, rowIdx) => (
              <tr
                key={country.id}
                className={`group transition-colors hover:bg-surface-bright ${
                  /* 교대 배경색 — No-Line 룰 */
                  rowIdx % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-high'
                }`}
              >
                {/* 국가명 (고정 컬럼) */}
                <td className={`sticky left-0 z-10 px-4 py-3 font-medium text-on-surface whitespace-nowrap transition-colors group-hover:bg-surface-bright ${
                  rowIdx % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-high'
                }`}>
                  <span className="mr-2">{countryCodeToFlag(country.code)}</span>
                  {country.name}
                </td>

                {/* 월별 매출 데이터 */}
                {columns.map((col) => {
                  const sale = findSales(salesData, country.id, col.year, col.month)
                  return (
                    <td
                      key={col.label}
                      className="px-4 py-3 text-right whitespace-nowrap"
                    >
                      {sale ? (
                        <span className="font-headline font-medium text-on-surface">
                          {sale.revenue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-outline">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
