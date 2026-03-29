/**
 * lib/utils/format.ts — 숫자/날짜 포맷팅 유틸리티
 *
 * 대시보드 전반에서 사용하는 포맷팅 함수들을 모아둡니다.
 * - 금액 포맷 (천 단위 구분, 통화 기호)
 * - 퍼센트 포맷 (증감 표시)
 * - 날짜 포맷 (한국어 형식)
 */
import { CURRENCY_SYMBOLS } from '@/lib/constants/countries'

/**
 * 숫자를 금액 형식으로 포맷
 *
 * 천 단위 콤마를 추가하고, 통화 기호를 앞에 붙입니다.
 * 예: formatCurrency(1250000, 'USD') → '$1,250,000'
 *     formatCurrency(85000000, 'KRW') → '₩85,000,000'
 *
 * @param amount - 포맷할 금액 (숫자)
 * @param currency - 통화 코드 (예: 'USD', 'KRW')
 * @param compact - true이면 억/만 단위로 축약 (예: '1.25억')
 * @returns 포맷된 금액 문자열
 */
export function formatCurrency(
  amount: number,
  currency: string = 'KRW',
  compact: boolean = false
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency

  if (compact && currency === 'KRW') {
    // 한국 원화는 억/만 단위로 축약 표시
    if (Math.abs(amount) >= 100_000_000) {
      return `${symbol}${(amount / 100_000_000).toFixed(1)}억`
    }
    if (Math.abs(amount) >= 10_000) {
      return `${symbol}${(amount / 10_000).toFixed(0)}만`
    }
  }

  // 기본: 천 단위 콤마 포맷
  const formatted = new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(amount)

  return `${symbol}${formatted}`
}

/**
 * 숫자를 퍼센트 형식으로 포맷 (증감 표시 포함)
 *
 * 양수는 ▲ +, 음수는 ▼ - 기호를 붙입니다.
 * 예: formatPercent(8.3)  → '▲ +8.3%'
 *     formatPercent(-5.1) → '▼ -5.1%'
 *     formatPercent(0)    → '0.0%'
 *
 * @param value - 퍼센트 값 (예: 8.3 = 8.3%)
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns 포맷된 퍼센트 문자열
 */
export function formatPercent(value: number, decimals: number = 1): string {
  const formatted = Math.abs(value).toFixed(decimals)

  if (value > 0) return `▲ +${formatted}%`
  if (value < 0) return `▼ -${formatted}%`
  return `${formatted}%`
}

/**
 * 전기간 대비 변화율 계산
 *
 * @param current - 현재 기간 값
 * @param previous - 이전 기간 값
 * @returns 변화율 (%, 소수점 포함). 이전값이 0이면 null 반환
 */
export function calcChangeRate(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

/**
 * 날짜를 한국어 형식으로 포맷
 *
 * 예: formatDateKR('2025-03-26') → '2025년 3월 26일'
 *     formatDateKR('2025-03-26', 'short') → '3월 26일'
 *
 * @param dateStr - ISO 날짜 문자열 (YYYY-MM-DD)
 * @param style - 'full'(연월일) 또는 'short'(월일만)
 * @returns 한국어 형식 날짜 문자열
 */
export function formatDateKR(dateStr: string, style: 'full' | 'short' = 'full'): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (style === 'short') return `${month}월 ${day}일`
  return `${year}년 ${month}월 ${day}일`
}

/**
 * 연도와 월을 한국어 형식으로 포맷
 *
 * 예: formatYearMonth(2025, 3) → '2025년 3월'
 *
 * @param year - 연도
 * @param month - 월 (1~12)
 * @returns 한국어 형식 연월 문자열
 */
export function formatYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`
}
