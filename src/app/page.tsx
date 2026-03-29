/**
 * page.tsx — 랜딩 페이지 (루트 경로: /)
 *
 * stitch (7) 디자인 구조 + 한국어 타이포 최적화 + 보완 버전.
 *
 * 구조:
 * 1. 네비바: fixed glassmorphism
 * 2. Hero: 12컬럼 비대칭 (7:5) + 우측 미리보기 카드
 * 3. 비교 테이블: 기존 방식 vs 글로벌 마켓 브리핑
 * 4. Features: 3컬럼 카드 (Lucide 아이콘)
 * 5. Bento Grid: 12컬럼 비대칭 (8:4+4:4)
 * 6. Testimonial: 인용문
 * 7. CTA: 큰 카드
 * 8. Footer: 4컬럼
 */
import Link from 'next/link'
import Image from 'next/image'
import { BarChart3, Bot, ArrowLeftRight, Upload, FileText, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══════════════ 네비바 ═══════════════ */}
      <nav className="fixed top-0 w-full z-50 bg-[#131314]/60 backdrop-blur-xl shadow-[0px_24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-8 py-5 max-w-[1400px] mx-auto">
          <span className="text-xl font-black tracking-tighter text-white font-headline">
            MARKET BRIEFING
          </span>
          <div className="hidden md:flex items-center gap-10">
            <a className="font-headline font-bold text-sm tracking-tight text-white/70 hover:text-white transition-colors duration-200" href="#compare">비교</a>
            <a className="font-headline font-bold text-sm tracking-tight text-white/70 hover:text-white transition-colors duration-200" href="#features">기능</a>
            <a className="font-headline font-bold text-sm tracking-tight text-white/70 hover:text-white transition-colors duration-200" href="#showcase">미리보기</a>
          </div>
          <Link href="/login" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-7 py-2.5 rounded-full font-headline font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95">
            시작하기
          </Link>
        </div>
      </nav>

      <main>
        {/* ═══════════════ Hero ═══════════════ */}
        <section className="relative min-h-screen flex items-center pt-28 pb-20 px-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full">

            {/* 좌측 7컬럼 */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-primary font-label font-bold tracking-[0.2em] uppercase text-xs mb-6">
                AI 기반 해외 시장 분석 자동화
              </span>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black leading-[0.9] tracking-tighter mb-10 text-white">
                7개국 실적을,<br />
                <span className="text-primary">하나의 화면</span>에.
              </h1>

              <p className="text-lg text-on-surface-variant max-w-md mb-12 leading-relaxed">
                7개국 해외 법인의 매출 데이터를 자동 시각화하고, AI가 주간 경영 브리핑을 생성합니다.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-10 py-4 rounded-full font-headline font-bold text-base hover:scale-105 transition-all duration-200 shadow-xl shadow-primary/20">
                  무료로 시작하기
                </Link>
                <a href="#compare" className="group flex items-center gap-3 px-7 py-4 rounded-full border border-outline/15 hover:bg-surface-bright transition-colors duration-200">
                  <span className="font-headline font-bold text-base">자세히 보기</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            {/* 우측 5컬럼 */}
            <div className="lg:col-span-5">
              {/* ── 데스크톱: 오피스 이미지 + 플로팅 배지 ── */}
              <div className="relative hidden lg:block">
                <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/hero-office.png"
                    alt="데이터 대시보드가 표시된 현대적 오피스"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 p-6 glass-morphism rounded-xl border border-outline/10 max-w-xs shadow-2xl">
                  <div className="text-primary font-headline font-bold text-4xl mb-1">7개국</div>
                  <div className="text-on-surface-variant text-sm font-medium tracking-wide">
                    해외 법인 매출 데이터를 실시간 모니터링하고 AI가 분석합니다.
                  </div>
                </div>
              </div>

              {/* ── 모바일: 핵심 수치 카드 3개 가로 배치 ── */}
              <div className="grid grid-cols-3 gap-3 lg:hidden">
                <div className="rounded-xl bg-surface-container-low p-4 text-center">
                  <p className="font-headline text-2xl font-black text-primary">7개국</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">해외 법인</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4 text-center">
                  <p className="font-headline text-2xl font-black text-white">AI</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">자동 브리핑</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4 text-center">
                  <p className="font-headline text-2xl font-black text-success">5분</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">보고서 완성</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 비교 테이블 (CLAUDE.md 핵심 가치 제안) ═══════════════ */}
        <section id="compare" className="py-28 px-8 bg-surface-container-low">
          <div className="max-w-[1400px] mx-auto">
            <div className="max-w-xl mb-16">
              <span className="text-primary font-label font-bold tracking-[0.2em] uppercase text-xs">Before &amp; After</span>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight text-white mt-4">뭐가 달라지나요?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기존 방식 */}
              <div className="rounded-2xl bg-surface-container p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={20} className="text-danger" />
                  <h3 className="font-headline text-xl font-bold text-white">기존 방식</h3>
                  <span className="ml-auto text-danger font-headline font-bold text-sm">~2시간</span>
                </div>
                {[
                  { icon: '📋', label: '7개국 매출을 엑셀에서 수동 취합', time: '30분' },
                  { icon: '🔍', label: '환율 변동을 매일 직접 검색', time: '10분' },
                  { icon: '📝', label: '주간 보고서를 워드로 수동 작성', time: '1시간' },
                  { icon: '🌐', label: '경쟁사 뉴스를 구글에서 수동 검색', time: '30분' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 py-3">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="text-on-surface-variant text-sm flex-1">{item.label}</span>
                    <span className="text-danger text-xs font-bold shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>

              {/* 글로벌 마켓 브리핑 */}
              <div className="rounded-2xl bg-primary-container/10 border border-primary/20 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Bot size={20} className="text-primary" />
                  <h3 className="font-headline text-xl font-bold text-white">마켓 브리핑</h3>
                  <span className="ml-auto text-primary font-headline font-bold text-sm">~5분</span>
                </div>
                {[
                  { icon: <Upload size={16} />, label: 'CSV 업로드 → 자동 집계·시각화', time: '30초' },
                  { icon: <ArrowLeftRight size={16} />, label: '실시간 환율 API 연동 → 자동 반영', time: '자동' },
                  { icon: <FileText size={16} />, label: 'AI가 데이터 기반 브리핑 자동 생성', time: '10초' },
                  { icon: <BarChart3 size={16} />, label: '대시보드에서 전체 현황 한눈에 확인', time: '즉시' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3">
                    <span className="text-primary shrink-0">{item.icon}</span>
                    <span className="text-on-surface-variant text-sm flex-1">{item.label}</span>
                    <span className="text-primary text-xs font-bold shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ Features ═══════════════ */}
        <section id="features" className="py-28 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight text-white mb-4">핵심 기능</h2>
                <p className="text-on-surface-variant text-base">CSV 업로드부터 AI 분석까지, 해외 시장 관리의 모든 것을 하나의 대시보드에서.</p>
              </div>
              <div className="h-px flex-grow bg-outline/10 mx-8 hidden lg:block" />
              <div className="text-primary font-headline font-bold tracking-tighter text-lg italic shrink-0">AI Powered</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <BarChart3 size={28} />, title: '매출 대시보드', desc: 'CSV 한 번 업로드로 7개국 매출이 차트와 테이블로 자동 시각화됩니다. KPI 카드로 전월 대비 증감을 한눈에 파악합니다.' },
                { icon: <Bot size={28} />, title: 'AI 주간 브리핑', desc: 'Claude AI가 매출, 환율, 경쟁사 데이터를 종합 분석하여 6장의 경영 브리핑 카드를 실시간 스트리밍으로 생성합니다.' },
                { icon: <ArrowLeftRight size={28} />, title: '실시간 환율 연동', desc: '7개국 통화의 원화 환율을 자동 수집하고, 30일 추이 차트와 간편 환산 계산기를 제공합니다.' },
              ].map((f) => (
                <div key={f.title} className="group p-8 rounded-2xl bg-surface-container border border-outline/5 hover:border-primary/20 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-primary">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ Bento Grid ═══════════════ */}
        <section id="showcase" className="py-28 px-8 bg-surface-container-low">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-16 space-y-3">
              <span className="text-primary font-label font-bold tracking-[0.2em] uppercase text-xs">Dashboard</span>
              <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-white">주요 화면</h2>
            </div>

            {/*
              ┌──────────────────────┬───────────────┐
              │                      │   주간 브리핑   │
              │     매출 현황         │   AI BRIEFING  │
              │   SALES DASHBOARD    ├───────────────┤
              │                      │  환율 모니터링   │
              │                      │ EXCHANGE RATE  │
              └──────────────────────┴───────────────┘
              grid-cols-5, h-[500px] 고정, 좌 col-span-3 + 우 col-span-2
            */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[500px]">
              {/* ── 좌측: 매출 현황 (col-span-3, h-full) ── */}
              <div className="md:col-span-3 group relative overflow-hidden rounded-2xl bg-surface-container h-[300px] md:h-full">
                <Image
                  src="/images/bento-dashboard.png"
                  alt="데이터 대시보드가 표시된 오피스"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <span className="text-primary font-label font-bold text-xs tracking-widest uppercase mb-2 block">Sales Dashboard</span>
                  <h3 className="text-2xl font-headline font-black text-white mb-2">매출 현황</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm">KPI 카드 · 월별 추이 차트 · 국가별 매트릭스 테이블</p>
                </div>
              </div>

              {/* ── 우측: 2개 카드 세로 쌓기 (col-span-2, flex-col) ── */}
              <div className="md:col-span-2 flex flex-col gap-4 h-auto md:h-full">
                {/* 주간 브리핑 — 위쪽 절반 */}
                <div className="group relative overflow-hidden rounded-2xl bg-surface-container flex-1 min-h-[200px]">
                  <Image
                    src="/images/bento-ai.png"
                    alt="AI 뉴럴 네트워크"
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 z-10">
                    <span className="text-primary font-label font-bold text-xs tracking-widest uppercase mb-1 block">AI Briefing</span>
                    <h3 className="text-xl font-headline font-bold text-white">주간 브리핑</h3>
                    <p className="text-on-surface-variant text-xs mt-1">6장 카드 · SSE 스트리밍</p>
                  </div>
                </div>

                {/* 환율 모니터링 — 아래쪽 절반 */}
                <div className="group relative overflow-hidden rounded-2xl bg-surface-container flex-1 min-h-[200px]">
                  <Image
                    src="/images/bento-exchange.png"
                    alt="글로벌 환율 네트워크"
                    fill
                    className="object-cover object-[30%_center] scale-125 transition-transform duration-700 group-hover:scale-[1.3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 z-10">
                    <span className="text-primary font-label font-bold text-xs tracking-widest uppercase mb-1 block">Exchange Rate</span>
                    <h3 className="text-xl font-headline font-bold text-white">환율 모니터링</h3>
                    <p className="text-on-surface-variant text-xs mt-1">30일 추이 · 환산 계산기</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ Testimonial ═══════════════ */}
        <section className="py-28 px-8 bg-surface-container-lowest border-y border-outline/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-6 md:gap-10 mb-14 opacity-40">
              {['EXCEL', 'WORD', 'GOOGLE', 'EMAIL'].map((t) => (
                <span key={t} className="font-headline font-black text-lg md:text-2xl tracking-tighter">{t}</span>
              ))}
            </div>

            <span className="text-primary text-5xl mb-6 block">&ldquo;</span>

            <blockquote className="text-2xl md:text-4xl font-headline font-medium leading-snug text-white mb-10">
              매주 7개국 법인 실적을 엑셀에서 취합하고, 환율을 검색하고, 보고서를 수동 작성하는 데 2시간 이상 소요됩니다.
            </blockquote>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-primary font-headline font-bold text-lg">AX</span>
              </div>
              <span className="text-white font-headline font-bold">경영지원팀 담당자</span>
              <span className="text-on-surface-variant text-xs tracking-widest uppercase mt-1">글로벌 제조업체 AX팀</span>
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="py-32 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-surface-container-high rounded-[2rem] p-10 md:p-20 flex flex-col items-center text-center border border-outline/10 relative overflow-hidden">
              {/* CTA 배경 이미지 */}
              <Image
                src="/images/cta-background.png"
                alt=""
                fill
                className="object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/80 to-surface-container-high/60" />

              <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-white mb-6 relative z-10">
                시작할 준비 되셨나요?
              </h2>
              <p className="text-lg text-on-surface-variant max-w-lg mb-10 relative z-10">
                데이터를 올리면 분석부터 보고서까지 AI가 자동으로 완성합니다.
              </p>

              <Link href="/signup" className="inline-flex items-center gap-5 group relative z-10">
                <span className="text-3xl md:text-5xl font-headline font-bold text-primary border-b-4 border-primary/20 pb-1 group-hover:border-primary transition-all duration-300">
                  무료로 시작하기
                </span>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shrink-0">
                  <span className="text-3xl">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="w-full pt-16 pb-8 bg-[#1c1b1c]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8 md:px-12 max-w-[1400px] mx-auto">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-bold text-white mb-5 block font-headline">MARKET BRIEFING</span>
            <p className="text-white/50 text-sm leading-relaxed max-w-[220px]">
              해외 법인 경영 데이터를 AI로 자동화하는 대시보드.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-5 font-headline text-sm">기능</h4>
            <ul className="space-y-3">
              {[
                { href: '/sales', label: '매출 대시보드' },
                { href: '/briefing', label: 'AI 브리핑' },
                { href: '/exchange', label: '환율 현황' },
                { href: '/competitors', label: '경쟁사 메모' },
              ].map((l) => (
                <li key={l.href}><Link className="text-white/50 hover:text-[#b7c4ff] hover:translate-x-1 transition-all duration-200 text-sm block" href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-5 font-headline text-sm">기술 스택</h4>
            <ul className="space-y-3">
              {['Next.js 14', 'TypeScript', 'Supabase', 'Claude AI'].map((t) => (
                <li key={t}><span className="text-white/50 text-sm block">{t}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-5 font-headline text-sm">시작하기</h4>
            <ul className="space-y-3">
              <li><Link className="text-white/50 hover:text-[#b7c4ff] hover:translate-x-1 transition-all duration-200 text-sm block" href="/signup">회원가입</Link></li>
              <li><Link className="text-white/50 hover:text-[#b7c4ff] hover:translate-x-1 transition-all duration-200 text-sm block" href="/login">로그인</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-white/40 text-xs tracking-widest uppercase">© 2025 Global Market Briefing</span>
          <span className="text-white/25 text-[10px] tracking-widest uppercase">Next.js + Supabase + Claude AI</span>
        </div>
      </footer>
    </div>
  )
}
