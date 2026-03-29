-- ============================================
-- 글로벌 마켓 브리핑 — Supabase 테이블 생성 SQL
-- ============================================
-- ※ 기존 Supabase 인스턴스를 다른 프로젝트와 공유하므로
--   모든 테이블에 gmb_ 접두사를 사용합니다.
-- ※ users 테이블은 별도로 만들지 않고 auth.users를 직접 참조합니다.
--
-- 실행 방법:
-- Supabase 대시보드 > SQL Editor에서 이 파일 전체를 붙여넣고 실행

-- ──────────────────────────────────────────────
-- 1. 국가 (법인) — gmb_countries
-- 해외 법인이 위치한 국가 정보를 저장합니다.
-- 설정 페이지에서 사용자가 추가/삭제할 수 있습니다.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gmb_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,           -- 국가 한글명 (예: '미국', '인도')
  code TEXT NOT NULL,           -- ISO 국가 코드 (예: 'US', 'IN')
  currency TEXT NOT NULL,       -- 통화 코드 (예: 'USD', 'INR')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 2. 월별 매출 데이터 — gmb_monthly_sales
-- 국가별 월별 매출, 주문건수, 신규고객 등을 저장합니다.
-- CSV 업로드 또는 수동 입력으로 데이터가 들어옵니다.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gmb_monthly_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id UUID REFERENCES gmb_countries(id) ON DELETE CASCADE NOT NULL,
  year INT NOT NULL,            -- 연도 (예: 2025)
  month INT NOT NULL,           -- 월 (1~12)
  revenue DECIMAL(15,2) NOT NULL,       -- 현지 통화 매출액
  revenue_krw DECIMAL(15,2),            -- 원화 환산 매출액
  orders INT,                           -- 주문 건수
  new_customers INT,                    -- 신규 고객 수
  memo TEXT,                            -- 특이사항 메모
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 같은 사용자의 같은 국가/연도/월에 중복 데이터 방지
  UNIQUE(user_id, country_id, year, month)
);

-- ──────────────────────────────────────────────
-- 3. 환율 데이터 — gmb_exchange_rates
-- 통화별 일별 환율(대원화)을 캐싱합니다.
-- 외부 환율 API에서 가져온 데이터를 저장합니다.
-- ※ user_id 없음 — 모든 인증 유저가 공유하는 공용 데이터
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gmb_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,       -- 통화 코드 (예: 'USD', 'INR')
  rate_to_krw DECIMAL(12,4),   -- 1 외화 = ? 원
  date DATE NOT NULL,           -- 기준 날짜
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 같은 통화/날짜에 중복 데이터 방지
  UNIQUE(currency, date)
);

-- ──────────────────────────────────────────────
-- 4. AI 브리핑 기록 — gmb_briefings
-- Claude API가 생성한 주간/월간 경영 브리핑을 저장합니다.
-- content 필드에 JSON 문자열로 6장 카드 데이터가 들어갑니다.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gmb_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,   -- 분석 기간 시작일
  period_end DATE NOT NULL,     -- 분석 기간 종료일
  briefing_type TEXT NOT NULL,  -- 'weekly' 또는 'monthly'
  content TEXT NOT NULL,        -- AI 생성 브리핑 본문 (JSON 문자열)
  data_snapshot JSONB,          -- 생성 시점 데이터 스냅샷
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 5. 경쟁사 메모 — gmb_competitor_notes
-- 사용자가 수동으로 입력하는 경쟁사 관련 메모입니다.
-- AI 브리핑 생성 시 이 데이터가 프롬프트에 포함됩니다.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gmb_competitor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  competitor_name TEXT NOT NULL, -- 경쟁사 이름
  note TEXT NOT NULL,           -- 메모 내용
  source TEXT,                  -- 출처 URL (선택)
  noted_at DATE DEFAULT CURRENT_DATE,  -- 메모 작성 날짜
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================
-- 모든 테이블에 사용자별 데이터 격리를 적용합니다.
-- 각 사용자는 자신의 데이터만 읽기/쓰기할 수 있습니다.
-- 환율 데이터는 공용이므로 인증된 모든 유저가 조회 가능합니다.

-- ── gmb_countries: 사용자 격리 ──
ALTER TABLE gmb_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_countries_user_isolation"
  ON gmb_countries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── gmb_monthly_sales: 사용자 격리 ──
ALTER TABLE gmb_monthly_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_monthly_sales_user_isolation"
  ON gmb_monthly_sales FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── gmb_exchange_rates: 인증 유저 조회, 서비스 롤만 쓰기 ──
ALTER TABLE gmb_exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_exchange_rates_read"
  ON gmb_exchange_rates FOR SELECT
  USING (auth.role() = 'authenticated');
-- ※ INSERT/UPDATE는 서비스 롤(admin.ts)로만 가능 — API Route에서 처리

-- ── gmb_briefings: 사용자 격리 ──
ALTER TABLE gmb_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_briefings_user_isolation"
  ON gmb_briefings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── gmb_competitor_notes: 사용자 격리 ──
ALTER TABLE gmb_competitor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_competitor_notes_user_isolation"
  ON gmb_competitor_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
