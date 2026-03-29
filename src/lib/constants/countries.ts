/**
 * lib/constants/countries.ts — 프리셋 국가(법인) 데이터
 *
 * "기본 설정으로 시작" 버튼 클릭 시 자동 생성되는 7개국 데이터입니다.
 * 설정 페이지에서 사용자가 국가를 추가할 때 참조하는 통화 목록도 포함합니다.
 */
import type { CountryInsert } from '@/types'

/** 기본 프리셋 7개국 — 글로벌 제조업체 해외 법인 기준 */
export const PRESET_COUNTRIES: CountryInsert[] = [
  { name: '미국',     code: 'US', currency: 'USD' },   // 미주 시장
  { name: '인도',     code: 'IN', currency: 'INR' },   // 남아시아 시장
  { name: '폴란드',   code: 'PL', currency: 'PLN' },   // 유럽(동유럽) 시장
  { name: '중국',     code: 'CN', currency: 'CNY' },   // 중화권 시장
  { name: '일본',     code: 'JP', currency: 'JPY' },   // 일본 시장
  { name: '독일',     code: 'DE', currency: 'EUR' },   // 유럽(서유럽) 시장
  { name: '베트남',   code: 'VN', currency: 'VND' },   // 동남아 시장
]

/**
 * 국가 코드 → 국기 이모지 변환
 *
 * ISO 3166-1 alpha-2 코드를 Regional Indicator Symbol로 변환합니다.
 * 예: 'US' → '🇺🇸', 'KR' → '🇰🇷'
 *
 * @param code - ISO 국가 코드 (2글자, 대문자)
 * @returns 국기 이모지 문자열
 */
export function countryCodeToFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65) // A=65, Regional Indicator A=0x1F1E6
  return String.fromCodePoint(...codePoints)
}

/**
 * 통화 코드 → 통화 기호 매핑
 *
 * 매출 금액 표시 시 통화 기호를 붙이기 위해 사용합니다.
 * 예: formatCurrency(1250000, 'USD') → '$1,250,000'
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',       // 미국 달러
  INR: '₹',       // 인도 루피
  PLN: 'zł',      // 폴란드 즈워티
  CNY: '¥',       // 중국 위안
  JPY: '¥',       // 일본 엔
  EUR: '€',       // 유로
  VND: '₫',       // 베트남 동
  KRW: '₩',       // 한국 원 (환산용)
}
