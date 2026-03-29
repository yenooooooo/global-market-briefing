/**
 * components/briefing/BriefingCards.tsx — 6장 브리핑 카드 캐러셀
 *
 * AI가 생성한 6장의 브리핑 카드를 캐러셀 형태로 표시합니다.
 *
 * 카드 구성 (CLAUDE.md 참고):
 * 1. 매출 종합 요약
 * 2. 국가별 상세 분석
 * 3. 환율 영향 분석
 * 4. 주요 이슈 & 리스크
 * 5. 경쟁사 동향 요약
 * 6. AI 액션 제안
 *
 * 디자인:
 * - 카드: surface-container-high 배경 + 둥근 모서리
 * - 좌우 화살표로 카드 이동
 * - 하단 인디케이터 도트
 * - 각 카드에 아이콘 + 제목 + 본문
 */
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BarChart3, Globe, ArrowLeftRight, AlertTriangle, Building2, CheckCircle } from 'lucide-react'
import type { BriefingCard } from '@/types'

/** 카드 제목별 아이콘 매핑 */
const CARD_ICONS: Record<string, React.ReactNode> = {
  '매출 종합': <BarChart3 size={20} />,
  '국가별 분석': <Globe size={20} />,
  '환율 영향': <ArrowLeftRight size={20} />,
  '주요 이슈': <AlertTriangle size={20} />,
  '경쟁사 동향': <Building2 size={20} />,
  '액션 제안': <CheckCircle size={20} />,
}

/** 카드 순서별 숫자 배지 색상 */
const CARD_COLORS = [
  'bg-primary/15 text-primary',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning',
  'bg-danger/15 text-danger',
  'bg-tertiary/15 text-tertiary',
  'bg-primary/15 text-primary',
]

interface BriefingCardsProps {
  cards: BriefingCard[]    // 6장의 카드 데이터
  summary?: string         // 전체 요약 (카드 상단에 표시)
}

export default function BriefingCards({ cards, summary }: BriefingCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  /** 이전 카드로 이동 */
  const goPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1))

  /** 다음 카드로 이동 */
  const goNext = () => setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0))

  if (cards.length === 0) return null

  const currentCard = cards[currentIndex]

  return (
    <div className="space-y-6">
      {/* ── 전체 요약 ── */}
      {summary && (
        <div className="rounded-xl bg-surface-container p-6">
          <p className="text-on-surface leading-relaxed">{summary}</p>
        </div>
      )}

      {/* ── 카드 캐러셀 — px-12로 화살표 버튼 공간 확보 ── */}
      <div className="relative px-12">
        {/* 카드 본체 */}
        <div className="rounded-2xl bg-surface-container-high p-8 min-h-[280px] flex flex-col">
          {/* 카드 상단: 번호 + 아이콘 + 제목 */}
          <div className="flex items-center gap-4 mb-6">
            {/* 순서 배지 */}
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${CARD_COLORS[currentIndex % CARD_COLORS.length]}`}>
              {currentIndex + 1}
            </span>
            {/* 아이콘 */}
            <span className="text-primary">
              {CARD_ICONS[currentCard.title] || <BarChart3 size={20} />}
            </span>
            {/* 제목 */}
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {currentCard.title}
            </h3>
          </div>

          {/* 카드 본문 */}
          <div className="flex-1">
            <p className="text-on-surface-variant leading-[1.8] text-base whitespace-pre-line">
              {currentCard.content}
            </p>
          </div>

          {/* 카드 하단: 페이지 번호 */}
          <div className="mt-6 text-xs text-outline font-label">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>

        {/* ── 좌우 화살표 버튼 ── */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── 인디케이터 도트 ── */}
      <div className="flex justify-center gap-2">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-6 bg-primary'
                : 'w-2 bg-outline-variant/30 hover:bg-outline'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
