/**
 * types/index.ts — 글로벌 타입 정의
 *
 * Supabase DB 스키마(gmb_ 접두사 테이블)에 대응하는 TypeScript 타입을 정의합니다.
 * 모든 컴포넌트와 API에서 이 타입들을 import하여 타입 안전성을 보장합니다.
 *
 * ※ users 테이블은 별도로 만들지 않고 Supabase Auth (auth.users)를 직접 사용합니다.
 */

/* ══════════════════════════════════════════════
   1. 국가 (법인) — gmb_countries 테이블
   ══════════════════════════════════════════════ */

/** 해외 법인이 위치한 국가 정보 */
export interface Country {
  id: string                    // UUID — 고유 식별자
  user_id: string               // UUID — 소유 사용자 (auth.users.id 참조)
  name: string                  // 국가 한글명 (예: '미국', '인도', '폴란드')
  code: string                  // ISO 국가 코드 (예: 'US', 'IN', 'PL')
  currency: string              // 통화 코드 (예: 'USD', 'INR', 'PLN')
  created_at: string            // 생성 일시 (ISO 8601 문자열)
}

/** 국가 생성 시 필요한 필드 (id, user_id, created_at은 자동 생성) */
export interface CountryInsert {
  name: string
  code: string
  currency: string
}

/* ══════════════════════════════════════════════
   2. 월별 매출 데이터 — gmb_monthly_sales 테이블
   ══════════════════════════════════════════════ */

/** 특정 국가의 월별 매출 레코드 */
export interface MonthlySales {
  id: string                    // UUID — 고유 식별자
  user_id: string               // UUID — 소유 사용자
  country_id: string            // UUID — 국가 참조 (gmb_countries.id)
  year: number                  // 연도 (예: 2025)
  month: number                 // 월 (1~12)
  revenue: number               // 현지 통화 매출액
  revenue_krw: number | null    // 원화 환산 매출액 (환율 적용 후)
  orders: number | null         // 주문 건수
  new_customers: number | null  // 신규 고객 수
  memo: string | null           // 특이사항 메모 (예: 'CES 참관 효과')
  created_at: string            // 생성 일시
}

/** 매출 데이터 입력/수정 시 필요한 필드 */
export interface MonthlySalesInsert {
  country_id: string
  year: number
  month: number
  revenue: number
  revenue_krw?: number | null
  orders?: number | null
  new_customers?: number | null
  memo?: string | null
}

/* ══════════════════════════════════════════════
   3. 환율 데이터 — gmb_exchange_rates 테이블
   ══════════════════════════════════════════════ */

/** 특정 날짜의 통화별 환율 (대원화 기준) */
export interface ExchangeRate {
  id: string                    // UUID — 고유 식별자
  currency: string              // 통화 코드 (예: 'USD', 'INR')
  rate_to_krw: number           // 1 외화 = ? 원 (대원화 환율)
  date: string                  // 기준 날짜 (YYYY-MM-DD)
  created_at: string            // 생성 일시
}

/* ══════════════════════════════════════════════
   4. AI 브리핑 — gmb_briefings 테이블
   ══════════════════════════════════════════════ */

/** AI가 생성한 경영 브리핑 레코드 */
export interface Briefing {
  id: string                    // UUID — 고유 식별자
  user_id: string               // UUID — 소유 사용자
  period_start: string          // 분석 기간 시작일 (YYYY-MM-DD)
  period_end: string            // 분석 기간 종료일 (YYYY-MM-DD)
  briefing_type: BriefingType   // 브리핑 유형 ('weekly' 또는 'monthly')
  content: string               // AI 생성 브리핑 본문 (JSON 문자열)
  data_snapshot: object | null  // 생성 시점의 데이터 스냅샷 (디버깅/재현용)
  created_at: string            // 생성 일시
}

/** 브리핑 유형 — 주간 또는 월간 */
export type BriefingType = 'weekly' | 'monthly'

/** AI 브리핑 카드 1장의 구조 (6장으로 구성) */
export interface BriefingCard {
  title: string                 // 카드 제목 (예: '매출 종합', '국가별 분석')
  content: string               // 카드 본문 (150~200자)
}

/** AI 응답의 전체 구조 — Claude API가 반환하는 JSON 형식 */
export interface BriefingResponse {
  summary: string               // 전체 요약 (2~3문장)
  cards: BriefingCard[]         // 6장의 브리핑 카드 배열
}

/* ══════════════════════════════════════════════
   5. 경쟁사 메모 — gmb_competitor_notes 테이블
   ══════════════════════════════════════════════ */

/** 사용자가 수동 입력한 경쟁사 관련 메모 */
export interface CompetitorNote {
  id: string                    // UUID — 고유 식별자
  user_id: string               // UUID — 소유 사용자
  competitor_name: string       // 경쟁사 이름
  note: string                  // 메모 내용
  source: string | null         // 출처 URL (선택)
  noted_at: string              // 메모 작성 날짜 (YYYY-MM-DD)
  created_at: string            // 생성 일시
}

/** 경쟁사 메모 입력 시 필요한 필드 */
export interface CompetitorNoteInsert {
  competitor_name: string
  note: string
  source?: string | null
  noted_at?: string
}

/* ══════════════════════════════════════════════
   6. 공통 유틸리티 타입
   ══════════════════════════════════════════════ */

/** 국가별 매출 데이터 + 국가 정보를 조인한 뷰 타입 */
export interface SalesWithCountry extends MonthlySales {
  country: Country              // 조인된 국가 정보
}

/** KPI 카드에 표시할 데이터 구조 */
export interface KPIData {
  label: string                 // 지표명 (예: '총 매출')
  value: string                 // 포맷된 값 (예: '₩12,340,000,000')
  change: number | null         // 전기간 대비 변화율 (% 단위, 예: 8.3)
  changeLabel?: string          // 변화 설명 (예: '전월 대비')
}

/** API 응답의 공통 에러 타입 */
export interface ApiError {
  message: string               // 사용자 친화적 에러 메시지
  code?: string                 // 에러 코드 (디버깅용)
}

/** CSV 업로드 시 파싱된 한 행의 데이터 */
export interface CSVSalesRow {
  country: string               // 국가명 (한글)
  year: number                  // 연도
  month: number                 // 월
  revenue: number               // 매출 (현지통화)
  orders?: number               // 주문 건수 (선택)
  new_customers?: number        // 신규 고객 수 (선택)
  memo?: string                 // 메모 (선택)
}

/* ══════════════════════════════════════════════
   7. 사이드바 네비게이션 타입
   ══════════════════════════════════════════════ */

/** 사이드바 메뉴 아이템 */
export interface NavItem {
  label: string                 // 메뉴 표시 텍스트 (한국어)
  href: string                  // 이동할 경로
  icon: string                  // Lucide 아이콘 이름
}
