# CLAUDE.md — 글로벌 마켓 브리핑 (Global Market Briefing)

> AI 기반 해외 시장 분석 자동화 대시보드
> "매일 아침 2시간 걸리던 해외 실적 정리·보고를 5분으로."

---

## 프로젝트 정체성

### 이 프로젝트가 존재하는 이유

40년 이상 된 글로벌 제조업체의 경영지원팀(AX팀)을 위한 포트폴리오 프로젝트.
해외 7개국 법인의 영업 실적·환율·경쟁사 동향을 분석하고, AI가 주간 경영 브리핑을 자동 생성하는 대시보드.

### 타겟 유저 페르소나

- **직함**: 글로벌 제조업체 경영지원팀 AX 담당자
- **나이대**: 30~50대
- **현재 업무**: 매일 아침 7개국 법인 실적을 엑셀로 취합, 환율 확인, 경쟁사 뉴스 검색, 주간 보고서 수동 작성
- **페인포인트**: 매주 반복되는 데이터 집계·보고에 2시간+, 분석할 시간이 없음
- **원하는 것**: 데이터 올리면 자동으로 정리되고, AI가 인사이트까지 뽑아주는 것

### 핵심 가치 제안

| 기존 방식 | 글로벌 마켓 브리핑 |
|-----------|-------------------|
| 7개국 매출을 엑셀에서 수동 취합 (30분) | CSV 업로드 → 자동 집계·시각화 (30초) |
| 환율 변동을 매일 직접 검색 (10분) | 실시간 환율 API 연동 → 자동 반영 |
| 주간 보고서를 워드로 수동 작성 (1시간) | AI가 데이터 기반 브리핑 자동 생성 (10초) |
| 경쟁사 뉴스를 구글에서 수동 검색 (30분) | 키워드 기반 자동 모니터링 + AI 요약 |

---

## 디자인 원칙

### 크리에이티브 방향: "The Digital Architect"

> 화면을 갤러리 공간처럼 다룬다. 조립된 느낌이 아니라 큐레이팅된 느낌.
> 깊은 차콜 서피스와 일렉트릭 블루 액센트의 하이 콘트라스트로 시각적 리듬을 만든다.
> Flat 디자인이 아니라, 톤 변화와 Glassmorphism으로 깊이감을 표현하는 공간적 경험.

### UI 벤치마크

- **1순위: stitch 디자인 시스템** — 다크 프리미엄, Glassmorphism, 비대칭 레이아웃
- **2순위: Linear** — 미니멀 사이드바, 다크 모드, 프로페셔널 톤
- **3순위: Vercel Dashboard** — 다크 데이터 대시보드, 깔끔한 테이블

### 핵심 디자인 규칙

#### No-Line 룰 (보더 금지)
- 1px solid border로 영역을 구분하지 않는다
- 구조는 **배경색 단계 차이**와 **여백**으로 정의한다
- 꼭 필요하면 "Ghost Border" — `outline-variant` (`#434656`) 15% 투명도로만

#### Surface 계층 (다크 테마 깊이)
1. **Base Layer:** `#131314` — 무한 캔버스 (페이지 배경)
2. **Section Layer:** `#1c1b1c` — 큰 콘텐츠 블록
3. **Component Layer:** `#201f20` — 카드, 인터랙티브 영역
4. **Elevation Layer:** `#2a2a2b` — 팝업, 드롭다운, 모달

#### Glassmorphism
- 플로팅 요소(네비바, 퀵 액션)에 적용
- `background: rgba(32, 31, 32, 0.6)` + `backdrop-filter: blur(20px)`
- 상단 하이라이트: `outline` (`#8d90a2`) 10% 투명도로 유리 엣지 표현

### 절대 금지

- ❌ `#000000` 순수 검정 사용 금지 — `#131314`로 대체
- ❌ 불투명 solid border로 콘텐츠 구분 — 여백과 배경색 차이로 대체
- ❌ 빽빽한 12컬럼 그리드 — 2~3컬럼은 비워서 "네거티브 에너지" 활용
- ❌ 영어 UI (타겟 유저가 한국인 경영지원팀)
- ❌ 과도한 애니메이션 — 호버에만 `200ms ease-out` 사용

### 컬러 시스템

```
── Surface (배경 계층) ──
surface:                 #131314   (Base — 페이지 배경)
surface-container-low:   #1c1b1c   (Section — 큰 블록)
surface-container:       #201f20   (Component — 카드)
surface-container-high:  #2a2a2b   (Elevation — 모달, 드롭다운)
surface-container-highest: #353436 (가장 높은 레벨)
surface-bright:          #3a393a   (호버 상태)

── Primary (블루 액센트) ──
primary:                 #b7c4ff   (일렉트릭 블루 — 강조, 링크)
primary-container:       #0052ff   (딥 블루 — CTA 그라데이션)
on-primary:              #001452   (Primary 위의 텍스트)
primary-fixed-dim:       #b7c4ff   (고정 Primary)

── 텍스트 ──
on-surface:              #e5e2e3   (기본 텍스트 — 밝은 화이트)
on-surface-variant:      #c3c5d9   (서브 텍스트)
outline:                 #8d90a2   (비활성 텍스트, 아이콘)
outline-variant:         #434656   (Ghost Border, 아주 미묘한 구분선)

── 시맨틱 컬러 (데이터 시각화) ──
success:                 #4ade80   (매출 상승 — 밝은 초록)
danger:                  #f87171   (매출 하락 — 밝은 빨강)
warning:                 #fbbf24   (주의 — 밝은 노랑)

── 기타 ──
tertiary:                #ffb4a1   (보조 강조색 — 따뜻한 코랄)
error:                   #ffb4ab   (에러 메시지)
```

### 타이포그래피

- **헤드라인/숫자**: Space Grotesk Bold — 매출 숫자, 페이지 제목, KPI 카드
- **본문 (한국어)**: Pretendard Regular — 한국어 가독성 최적화
- **레이블**: Inter Medium, uppercase, tracking 5% — 카테고리, 필터 칩
- **AI 브리핑 텍스트**: Pretendard, 16px, line-height 1.8

### 버튼 스타일

- **Primary CTA**: `bg-gradient-to-r from-primary to-primary-container` + `rounded-full` + 호버 시 1.02x 스케일 + 블루 글로우
- **Secondary**: 서피스 배경 + Ghost Border + 호버 시 `surface-bright`로 변경
- **호버 인터랙션**: `200ms ease-out`, scale 1.02~1.05

### 반응형

- 데스크톱 우선 (경영지원팀은 PC로 업무)
- 모바일은 기본 대응만 (축소 레이아웃)
- 최소 너비: 1280px 기준 설계

---

## 기술 스택

### 프론트엔드
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (커스텀 디자인 토큰)
- **Recharts** (차트 — 사장님비서에서 사용한 것과 동일)
- **Lucide React** (아이콘)
- **Framer Motion** (카드 전환 애니메이션, 최소한만)

### 백엔드 & DB
- **Supabase** (PostgreSQL + Auth + Storage)
- **Next.js API Routes** (서버 사이드 로직)

### AI
- **Anthropic Claude API** (Haiku — 브리핑 생성, 빠르고 저렴)
- **SSE 스트리밍** (브리핑 실시간 생성)

### 외부 API
- **ExchangeRate API** (무료 환율 데이터) 또는 한국수출입은행 환율 API
- 뉴스 API는 MVP에서 제외 (데이터를 직접 입력하는 방식으로)

### 배포
- **Vercel** (무료)
- **도메인**: global-briefing.vercel.app (또는 유사)

---

## 데이터베이스 스키마

### ⚠️ Supabase 공유 프로젝트 규칙

> **이 프로젝트는 기존 Supabase 인스턴스를 다른 프로젝트들과 공유합니다.**
> - 모든 테이블명에 `gmb_` 접두사 필수 (Global Market Briefing)
> - 다른 프로젝트 테이블과 절대 충돌하지 않도록 주의
> - RLS 정책명도 `gmb_` 접두사 사용
> - users 테이블은 Supabase Auth의 `auth.users`를 직접 사용 (별도 생성 X)

### 테이블 설계

```sql
-- ※ users 테이블은 만들지 않음 — Supabase Auth (auth.users)를 직접 참조
-- user_id는 auth.uid()로 자동 매핑

-- 1. 국가 (법인)
CREATE TABLE gmb_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,           -- '미국', '인도', '폴란드' 등
  code TEXT NOT NULL,           -- 'US', 'IN', 'PL' 등
  currency TEXT NOT NULL,       -- 'USD', 'INR', 'PLN' 등
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 월별 매출 데이터
CREATE TABLE gmb_monthly_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id UUID REFERENCES gmb_countries(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  revenue DECIMAL(15,2) NOT NULL,       -- 현지 통화 매출
  revenue_krw DECIMAL(15,2),            -- 원화 환산
  orders INT,                           -- 주문 건수
  new_customers INT,                    -- 신규 고객 수
  memo TEXT,                            -- 특이사항 메모
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, country_id, year, month)
);

-- 3. 환율 데이터
CREATE TABLE gmb_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,       -- 'USD', 'INR' 등
  rate_to_krw DECIMAL(12,4),   -- 원화 환율
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(currency, date)
);

-- 4. AI 브리핑 기록
CREATE TABLE gmb_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  briefing_type TEXT NOT NULL,          -- 'weekly', 'monthly'
  content TEXT NOT NULL,                -- AI 생성 브리핑 본문
  data_snapshot JSONB,                  -- 생성 시점 데이터 스냅샷
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 경쟁사 메모 (수동 입력)
CREATE TABLE gmb_competitor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  note TEXT NOT NULL,
  source TEXT,                          -- 출처 URL
  noted_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS 정책

모든 테이블에 사용자별 데이터 격리 적용 (정책명도 `gmb_` 접두사):
```sql
-- gmb_countries
ALTER TABLE gmb_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_countries_user_isolation"
  ON gmb_countries FOR ALL
  USING (auth.uid() = user_id);

-- gmb_monthly_sales
ALTER TABLE gmb_monthly_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_monthly_sales_user_isolation"
  ON gmb_monthly_sales FOR ALL
  USING (auth.uid() = user_id);

-- gmb_exchange_rates (환율은 공용 데이터 — 모든 인증 유저 조회 가능)
ALTER TABLE gmb_exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_exchange_rates_read"
  ON gmb_exchange_rates FOR SELECT
  USING (auth.role() = 'authenticated');

-- gmb_briefings
ALTER TABLE gmb_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_briefings_user_isolation"
  ON gmb_briefings FOR ALL
  USING (auth.uid() = user_id);

-- gmb_competitor_notes
ALTER TABLE gmb_competitor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmb_competitor_notes_user_isolation"
  ON gmb_competitor_notes FOR ALL
  USING (auth.uid() = user_id);
```

---

## 페이지 구조

```
app/
├── page.tsx                        # 랜딩 페이지
├── (auth)/
│   ├── login/page.tsx              # 로그인
│   └── signup/page.tsx             # 회원가입
├── (dashboard)/
│   ├── layout.tsx                  # 사이드바 + 헤더 공통 레이아웃
│   ├── home/page.tsx               # 홈 대시보드 (오늘의 요약)
│   ├── sales/page.tsx              # 매출 현황 (국가별 차트 + 테이블)
│   ├── sales/upload/page.tsx       # 매출 데이터 업로드 (CSV)
│   ├── exchange/page.tsx           # 환율 현황
│   ├── briefing/page.tsx           # AI 주간 브리핑
│   ├── briefing/archive/page.tsx   # 과거 브리핑 아카이브
│   ├── competitors/page.tsx        # 경쟁사 메모
│   └── settings/page.tsx           # 설정 (국가/법인 관리)
├── api/
│   ├── briefing/generate/route.ts  # AI 브리핑 생성 (SSE)
│   ├── sales/upload/route.ts       # CSV 파싱 + DB 저장
│   ├── exchange/rate/route.ts      # 환율 조회
│   └── export/pdf/route.ts         # PDF 내보내기
```

---

## 컴포넌트 설계

### 공통 (shared/)
- `Sidebar.tsx` — 좌측 네비게이션 (토스 스타일)
- `Header.tsx` — 상단 바 (페이지 타이틀 + 유저)
- `StatCard.tsx` — 숫자 카드 (매출, 건수 등)
- `ChangeIndicator.tsx` — 전월 대비 증감 표시 (▲ +12.3% 초록 / ▼ -5.1% 빨강)
- `CSVUploader.tsx` — 드래그앤드롭 CSV 업로드
- `EmptyState.tsx` — 데이터 없을 때 안내
- `LoadingSkeleton.tsx` — 로딩 스켈레톤

### 홈 대시보드 (home/)
- `TodaySummary.tsx` — 오늘의 핵심 지표 3~4개
- `CountrySalesOverview.tsx` — 국가별 매출 미니 바 차트
- `RecentBriefingCard.tsx` — 최근 AI 브리핑 미리보기
- `ExchangeRateStrip.tsx` — 주요 환율 가로 스트립

### 매출 현황 (sales/)
- `SalesChart.tsx` — 월별 매출 추이 (Recharts Line/Bar)
- `CountryCompareChart.tsx` — 국가 비교 차트
- `SalesTable.tsx` — 국가×월 매트릭스 테이블
- `SalesUploadForm.tsx` — CSV 업로드 + 미리보기 + 확인
- `KPICards.tsx` — 총매출, 전월대비, 최고국가, 최저국가

### AI 브리핑 (briefing/)
- `BriefingGenerator.tsx` — 기간 선택 + 생성 버튼
- `BriefingStream.tsx` — SSE 스트리밍 표시 (타이핑 효과)
- `BriefingCard.tsx` — 완성된 브리핑 카드 (6장 캐러셀)
  - 카드 1: 매출 종합 요약
  - 카드 2: 국가별 상세 분석
  - 카드 3: 환율 영향 분석
  - 카드 4: 주요 이슈 & 리스크
  - 카드 5: 경쟁사 동향 요약
  - 카드 6: AI 액션 제안 (다음 주 할 일 3~4개)
- `BriefingArchiveList.tsx` — 과거 브리핑 목록
- `BriefingExport.tsx` — PDF 다운로드 / 이메일 전송

### 환율 (exchange/)
- `ExchangeRateTable.tsx` — 통화별 현재 환율 + 등락
- `ExchangeChart.tsx` — 30일 환율 추이 차트
- `CurrencyConverter.tsx` — 간단 환산 계산기

### 경쟁사 (competitors/)
- `CompetitorNoteForm.tsx` — 경쟁사 메모 입력 (이름, 내용, 출처)
- `CompetitorNoteList.tsx` — 메모 목록 (날짜순)
- `CompetitorTimeline.tsx` — 타임라인 뷰

---

## AI 브리핑 프롬프트 설계

### 시스템 프롬프트

```
당신은 글로벌 제조업체의 경영분석 전문가입니다.
해외 법인의 월별 매출 데이터, 환율 변동, 경쟁사 동향을 분석하여
경영진이 빠르게 의사결정할 수 있는 주간 브리핑을 작성합니다.

작성 원칙:
1. 숫자는 반드시 포함 (전월 대비 %, 금액)
2. "좋다/나쁘다"가 아니라 "왜 그런지" 원인을 분석
3. 마지막에 반드시 실행 가능한 제안 3~4개 제시
4. 한국어로 작성, 존댓말, 간결한 문장
5. 전체 길이: 카드당 150~200자

출력 형식: JSON
{
  "summary": "전체 요약 (2~3문장)",
  "cards": [
    { "title": "매출 종합", "content": "..." },
    { "title": "국가별 분석", "content": "..." },
    { "title": "환율 영향", "content": "..." },
    { "title": "주요 이슈", "content": "..." },
    { "title": "경쟁사 동향", "content": "..." },
    { "title": "액션 제안", "content": "..." }
  ]
}
```

### 유저 프롬프트 (동적)

```
아래는 {기간}의 해외 법인 매출 데이터입니다.

[매출 데이터]
{국가별 매출 JSON}

[환율 변동]
{기간 내 환율 변동 데이터}

[경쟁사 메모]
{사용자가 입력한 경쟁사 메모}

위 데이터를 분석하여 주간 경영 브리핑을 작성해주세요.
```

---

## CSV 업로드 형식

### 지원하는 CSV 구조

```csv
국가,연도,월,매출(현지통화),주문건수,신규고객수,메모
미국,2025,1,1250000,48,12,CES 참관 효과
인도,2025,1,85000000,62,28,신규 대리점 계약
폴란드,2025,1,420000,15,3,
중국,2025,1,3200000,38,8,춘절 영향 감소
일본,2025,1,18500000,22,5,
```

### 업로드 플로우

1. CSV 파일 드래그앤드롭 또는 파일 선택
2. 미리보기 테이블 표시 (첫 5행)
3. 컬럼 매핑 확인 (자동 감지 + 수동 수정 가능)
4. "업로드" 클릭 → DB 저장
5. 성공/실패 결과 표시

---

## 데모 데이터

### 초기 세팅 시 7개국 데모 데이터 자동 생성

프로젝트를 처음 열었을 때 빈 화면이면 인상이 안 좋으므로,
온보딩 후 "데모 데이터로 시작하기" 옵션 제공.

데모 국가: 미국(USD), 인도(INR), 폴란드(PLN), 중국(CNY), 일본(JPY), 유럽-독일(EUR), 동남아-베트남(VND)
데모 기간: 최근 12개월
데모 매출: 국가별 현실적 금액 범위로 랜덤 생성 (트렌드 포함)

---

## 구현 순서 (우선순위)

### Phase 1: 코어 (MVP)
1. 프로젝트 셋업 (Next.js + Supabase + Tailwind)
2. 인증 (Supabase Auth — 이메일 로그인)
3. 대시보드 레이아웃 (사이드바 + 헤더)
4. 국가(법인) 설정 페이지
5. 매출 데이터 수동 입력 폼
6. 매출 현황 페이지 (차트 + 테이블)
7. AI 주간 브리핑 생성 (SSE 스트리밍)

### Phase 2: 데이터 확장
8. CSV 업로드 기능
9. 환율 API 연동
10. 환율 현황 페이지
11. 홈 대시보드 (요약 지표)

### Phase 3: 부가 기능
12. 경쟁사 메모 입력/조회
13. 브리핑 아카이브
14. PDF 내보내기
15. 데모 데이터 자동 생성

### Phase 4: 마무리
16. 랜딩 페이지
17. 반응형 대응
18. 배포 + README 작성

---

## 코드 품질 규칙

- **TypeScript strict 모드** 사용
- **컴포넌트 파일명**: PascalCase (SalesChart.tsx)
- **훅 파일명**: camelCase (useSalesData.ts)
- **API Route**: kebab-case 폴더 (/api/briefing/generate/)
- **주석**: 모든 코드 파일에 한국어 주석을 자세하게 작성
  - 파일 상단: 파일의 역할/목적 설명
  - 함수/컴포넌트: 매개변수, 반환값, 동작 설명
  - 주요 로직 블록: 왜 이렇게 구현했는지 의도 설명
  - 상수/타입: 각 필드의 의미 설명
- **에러 처리**: try-catch + 사용자 친화적 에러 메시지
- **로딩 상태**: 모든 데이터 페칭에 스켈레톤 UI

---

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude API
ANTHROPIC_API_KEY=

# 환율 API
EXCHANGE_RATE_API_KEY=
```

---

## 이 프로젝트의 포트폴리오 포지셔닝

면접에서 이렇게 설명:

> "글로벌 제조업체 경영지원팀의 해외 시장 분석·보고 업무를 이해하고,
> 그 업무가 AI로 어떻게 자동화될 수 있는지 직접 프로토타입을 만들어봤습니다.
> 7개국 법인 매출 데이터를 시각화하고,
> AI가 주간 경영 브리핑을 자동 생성하는 대시보드입니다."
