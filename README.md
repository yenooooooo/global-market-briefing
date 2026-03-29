# 글로벌 마켓 브리핑 (Global Market Briefing)

> 매일 아침 2시간 걸리던 해외 실적 보고를 5분으로.

해외 7개국 법인의 매출 데이터를 자동 시각화하고, AI가 주간 경영 브리핑을 생성하는 대시보드입니다.

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-191919?style=flat-square&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square)](https://recharts.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

🔗 **배포 URL**: [global-market-briefing.vercel.app](https://global-market-briefing.vercel.app)

---

## 프로젝트 소개

### 누구를 위한 서비스인가?

해외 법인을 운영하는 **글로벌 제조업체의 경영지원팀**을 위한 대시보드입니다.

### 어떤 문제를 해결하는가?

| 기존 방식 | 소요 시간 | 마켓 브리핑 | 소요 시간 |
|-----------|----------|------------|----------|
| 7개국 매출을 엑셀에서 수동 취합 | 30분 | CSV 업로드 → 자동 집계·시각화 | 30초 |
| 환율 변동을 매일 직접 검색 | 10분 | 환율 API 실시간 연동 | 자동 |
| 주간 보고서를 워드로 수동 작성 | 1시간 | AI가 데이터 기반 브리핑 생성 | 10초 |
| 경쟁사 뉴스를 구글에서 수동 검색 | 30분 | 메모 기록 → AI 브리핑에 반영 | 즉시 |

---

## 주요 기능

### 📊 매출 대시보드

KPI 카드로 핵심 지표를 한눈에 파악하고, 국가별 매출 추이를 차트와 테이블로 시각화합니다.

- 전월 대비 증감률 자동 계산
- 국가별 스택형 바 차트 (Recharts)
- 국가×월 매트릭스 테이블 (가로 스크롤)

> 📸 *스크린샷 추가 예정*

### 🤖 AI 주간 브리핑

매출, 환율, 경쟁사 데이터를 Claude AI가 종합 분석하여 6장의 경영 브리핑 카드를 자동 생성합니다.

- SSE 스트리밍으로 실시간 생성 과정 표시
- 6장 카드 캐러셀 (매출 종합 → 국가별 분석 → 환율 영향 → 주요 이슈 → 경쟁사 동향 → 액션 제안)
- 과거 브리핑 아카이브 조회

> 📸 *스크린샷 추가 예정*

### 💱 환율 모니터링

7개국 통화의 원화 환율을 실시간으로 조회하고, 30일 추이를 차트로 확인합니다.

- ExchangeRate API 연동 + DB 캐싱
- 30일 추이 AreaChart (호버 시 도트 + 점선 가이드)
- 간편 환산 계산기

> 📸 *스크린샷 추가 예정*

### 📁 CSV 업로드

드래그앤드롭으로 CSV 파일을 업로드하면 자동 파싱 후 미리보기를 표시하고, 확인 후 DB에 저장합니다.

- react-dropzone + papaparse
- 한글 헤더 자동 매핑 (국가, 연도, 월, 매출 등)
- 샘플 CSV 다운로드 제공

> 📸 *스크린샷 추가 예정*

---

## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|----------|
| 프론트엔드 | Next.js 14 (App Router) | 풀스택 개발, 서버 컴포넌트로 보안·성능 확보 |
| 언어 | TypeScript (Strict) | 타입 안정성, 자동 완성으로 개발 생산성 향상 |
| 스타일 | Tailwind CSS v4 | 커스텀 디자인 토큰, 빠른 UI 개발 |
| DB / 인증 | Supabase (PostgreSQL) | RLS로 사용자별 데이터 격리, Auth 내장 |
| AI | Claude API (Haiku) | 분석 품질 우수, SSE 스트리밍 지원 |
| 차트 | Recharts | React 네이티브, 다크 테마 커스텀 용이 |
| 상태 관리 | Zustand | 최소한의 보일러플레이트 |
| 배포 | Vercel | Git push 시 자동 빌드·배포 |

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                      클라이언트                          │
│  Next.js App Router (React Server + Client Components)  │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
     CSV 업로드        환율 조회      브리핑 생성
     (papaparse)    (API Route)    (API Route)
             │              │              │
             ▼              ▼              ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase     │  │ ExchangeRate │  │  Claude API  │
│  PostgreSQL    │  │    API       │  │   (Haiku)    │
│  + Auth + RLS  │  │  (무료 플랜)  │  │ SSE 스트리밍  │
└────────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
  사용자별 데이터 격리 (RLS)
  gmb_countries / gmb_monthly_sales
  gmb_exchange_rates / gmb_briefings
  gmb_competitor_notes
```

---

## 프로젝트 배경

글로벌 제조업체의 AX(업무자동화) 직무에 지원하면서, 해외 시장 분석·보고 업무가 AI로 어떻게 자동화될 수 있는지 직접 프로토타입을 만들어봤습니다. 7개국 법인의 매출 데이터를 시각화하고, Claude AI가 주간 경영 브리핑을 자동 생성하는 과정을 구현하여 "데이터 수집 → 분석 → 보고"의 전체 워크플로우를 하나의 대시보드에 담았습니다.

---

## 로컬 실행 방법

```bash
# 1. 클론
git clone https://github.com/yenooooooo/global-market-briefing.git
cd global-market-briefing

# 2. 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 아래 값을 입력:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - ANTHROPIC_API_KEY
# - EXCHANGE_RATE_API_KEY

# 4. Supabase 테이블 생성
# supabase/migrations/001_create_tables.sql을 SQL Editor에서 실행

# 5. 실행
npm run dev
```

회원가입 후 온보딩에서 **"데모 데이터로 시작하기"**를 클릭하면 7개국 × 12개월 샘플 데이터가 자동 생성됩니다.

---

**연호** · [사장님비서 프로젝트](https://github.com/yenooooooo)
