# 글로벌 마켓 브리핑 (Global Market Briefing)

해외 7개국 법인의 매출 데이터를 시각화하고, AI가 주간 경영 브리핑을 자동 생성하는 대시보드입니다.

> 글로벌 제조업체 경영지원팀의 해외 시장 분석·보고 업무를 자동화하는 포트폴리오 프로젝트

## 핵심 기능

### 매출 대시보드
- CSV 업로드로 7개국 매출 데이터 일괄 등록
- KPI 카드 (총 매출, 전월 대비, 최고/최저 성장 국가)
- 월별 매출 추이 차트 (Recharts 스택형 BarChart)
- 국가×월 매트릭스 테이블

### AI 주간 브리핑
- Claude API를 활용한 경영 브리핑 자동 생성
- SSE 스트리밍으로 실시간 생성 과정 표시
- 6장 카드 캐러셀 (매출 종합, 국가별 분석, 환율 영향, 주요 이슈, 경쟁사 동향, 액션 제안)
- 브리핑 아카이브 (과거 브리핑 조회/삭제)

### 환율 현황
- ExchangeRate API 연동으로 7개국 통화 실시간 환율 조회
- 30일 추이 AreaChart (호버 시 도트 + 점선 가이드)
- 간편 환산 계산기

### 경쟁사 메모
- 경쟁사 동향 수동 기록 (이름, 내용, 출처 URL)
- 타임라인 형식 목록
- AI 브리핑 생성 시 자동 반영

## 기술 스택

| 분류 | 기술 |
|------|------|
| **프론트엔드** | Next.js 14 (App Router), TypeScript, Tailwind CSS v4 |
| **차트** | Recharts (BarChart, AreaChart) |
| **아이콘** | Lucide React |
| **상태 관리** | Zustand |
| **백엔드/DB** | Supabase (PostgreSQL + Auth + RLS) |
| **AI** | Anthropic Claude API (SSE 스트리밍) |
| **환율** | ExchangeRate API |
| **배포** | Vercel |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                        # 랜딩 페이지
│   ├── (auth)/
│   │   ├── login/page.tsx              # 로그인
│   │   └── signup/page.tsx             # 회원가입
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # 사이드바 + 헤더 레이아웃
│   │   ├── home/page.tsx               # 홈 대시보드
│   │   ├── sales/page.tsx              # 매출 현황
│   │   ├── sales/upload/page.tsx       # 매출 입력 (CSV + 수동)
│   │   ├── exchange/page.tsx           # 환율 현황
│   │   ├── briefing/page.tsx           # AI 브리핑 생성
│   │   ├── briefing/archive/page.tsx   # 브리핑 아카이브
│   │   ├── competitors/page.tsx        # 경쟁사 메모
│   │   └── settings/page.tsx           # 국가(법인) 설정
│   └── api/
│       ├── briefing/generate/route.ts  # AI 브리핑 SSE API
│       ├── sales/upload/route.ts       # CSV 업로드 API
│       ├── exchange/rate/route.ts      # 환율 조회/캐싱 API
│       └── demo/seed/route.ts          # 데모 데이터 시딩 API
├── components/
│   ├── layout/                         # Sidebar, Header
│   ├── sales/                          # SalesChart, SalesTable, CSVUploader
│   ├── briefing/                       # BriefingGenerator, BriefingCards
│   └── shared/                         # StatCard
├── hooks/                              # useSalesData
├── stores/                             # useAuthStore (Zustand)
├── lib/
│   ├── supabase/                       # client, server, admin
│   ├── constants/                      # navigation, countries
│   └── utils/                          # format (금액, %, 날짜)
└── types/                              # TypeScript 타입 정의
```

## 시작하기

### 1. 설치

```bash
git clone https://github.com/your-username/global-market-briefing.git
cd global-market-briefing
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 API 키를 입력합니다:
- **Supabase**: [supabase.com](https://supabase.com) 프로젝트 생성 후 API 키 복사
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) API 키 발급
- **ExchangeRate**: [exchangerate-api.com](https://www.exchangerate-api.com) 무료 키 발급

### 3. Supabase 테이블 생성

`supabase/migrations/001_create_tables.sql`을 Supabase SQL Editor에서 실행합니다.

### 4. 실행

```bash
npm run dev
```

### 5. 데모 데이터

회원가입 후 온보딩 페이지에서 "데모 데이터로 시작하기"를 클릭하면 7개국 × 12개월 매출 데이터가 자동 생성됩니다.

## 디자인 시스템

**"The Digital Architect"** — Stitch 디자인 시스템 기반

- **다크 테마**: Surface 계층 구조 (`#131314` → `#1c1b1c` → `#201f20` → `#2a2a2b`)
- **No-Line 룰**: 1px border 대신 배경색 차이와 여백으로 영역 구분
- **Glassmorphism**: 네비바, 헤더에 `backdrop-blur + 60% 투명도` 적용
- **타이포**: Space Grotesk (헤드라인/숫자) + Pretendard (한국어 본문) + Inter (레이블)
- **액센트**: Electric Blue (`#b7c4ff` → `#0052ff` 그라데이션)

## 데이터베이스 스키마

모든 테이블에 `gmb_` 접두사 사용 (Supabase 공유 인스턴스 충돌 방지)

| 테이블 | 용도 |
|--------|------|
| `gmb_countries` | 해외 법인 국가 정보 (7개국) |
| `gmb_monthly_sales` | 국가별 월별 매출 데이터 |
| `gmb_exchange_rates` | 환율 캐시 (공용 데이터) |
| `gmb_briefings` | AI 생성 브리핑 기록 |
| `gmb_competitor_notes` | 경쟁사 메모 |

모든 테이블에 RLS (Row Level Security) 정책 적용으로 사용자별 데이터 격리.

## 라이선스

MIT
