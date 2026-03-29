/**
 * (dashboard)/briefing/page.tsx — AI 주간 브리핑 페이지
 *
 * Claude API를 사용하여 매출/경쟁사 데이터를 분석한
 * AI 경영 브리핑을 생성하고 6장 카드로 표시하는 핵심 페이지입니다.
 *
 * 구성:
 * 1. BriefingGenerator: 기간 선택 + 생성 버튼
 * 2. 스트리밍 표시: SSE 수신 중 타이핑 효과
 * 3. BriefingCards: 6장 캐러셀 (완료 시)
 *
 * SSE 스트리밍 플로우:
 * 1. 생성 버튼 클릭 → /api/briefing/generate POST
 * 2. SSE 이벤트 수신 → streamingText에 누적
 * 3. type: 'done' 수신 → JSON 파싱 → cards 상태에 저장
 * 4. 파싱 실패 시 전체 텍스트를 1장 카드로 표시
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Archive } from 'lucide-react'
import { useSalesData } from '@/hooks/useSalesData'
import BriefingGenerator from '@/components/briefing/BriefingGenerator'
import BriefingCards from '@/components/briefing/BriefingCards'
import type { BriefingResponse, BriefingCard } from '@/types'

export default function BriefingPage() {
  const { salesData } = useSalesData(12)

  /* ── 브리핑 생성 상태 ── */
  const [isGenerating, setIsGenerating] = useState(false)    // 생성 중 여부
  const [streamingText, setStreamingText] = useState('')      // SSE 수신 중 텍스트
  const [briefingCards, setBriefingCards] = useState<BriefingCard[]>([])  // 완성된 카드
  const [briefingSummary, setBriefingSummary] = useState('')   // 전체 요약
  const [error, setError] = useState('')                       // 에러 메시지

  /**
   * 브리핑 생성 핸들러
   *
   * /api/briefing/generate에 POST 요청을 보내고
   * SSE 이벤트를 수신하여 실시간으로 텍스트를 표시합니다.
   *
   * @param periodStart - 분석 기간 시작일 (YYYY-MM-DD)
   * @param periodEnd - 분석 기간 종료일 (YYYY-MM-DD)
   * @param type - 'weekly' 또는 'monthly'
   */
  const handleGenerate = async (periodStart: string, periodEnd: string, type: string) => {
    setIsGenerating(true)
    setStreamingText('')
    setBriefingCards([])
    setBriefingSummary('')
    setError('')

    try {
      /* API 호출 */
      const response = await fetch('/api/briefing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_start: periodStart,
          period_end: periodEnd,
          briefing_type: type,
        }),
      })

      /* 에러 응답 처리 */
      if (!response.ok) {
        const errData = await response.json()
        setError(errData.message || '브리핑 생성에 실패했습니다.')
        setIsGenerating(false)
        return
      }

      /* ── SSE 스트림 읽기 ── */
      const reader = response.body?.getReader()
      if (!reader) {
        setError('스트리밍 연결에 실패했습니다.')
        setIsGenerating(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''
      /* 스트리밍 진행 단계 표시용 메시지 */
      const progressMessages = [
        '매출 데이터를 분석하고 있습니다...',
        '국가별 추이를 비교하고 있습니다...',
        '경쟁사 동향을 반영하고 있습니다...',
        '경영 브리핑을 작성하고 있습니다...',
      ]
      let progressIdx = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6)

          try {
            const event = JSON.parse(jsonStr)

            if (event.type === 'text') {
              /* JSON 원문은 사용자에게 보여주지 않고, 진행 메시지만 표시 */
              accumulated += event.content
              /* 일정 길이마다 진행 메시지 변경 */
              const newIdx = Math.min(
                Math.floor(accumulated.length / 200),
                progressMessages.length - 1
              )
              if (newIdx !== progressIdx) progressIdx = newIdx
              setStreamingText(progressMessages[progressIdx])
            } else if (event.type === 'done') {
              /*
               * 스트리밍 완료 → JSON 파싱
               * Claude가 ```json 마크다운 블록으로 감쌀 수 있으므로 정리
               */
              let content = event.content as string

              /* ```json ... ``` 블록 제거 */
              const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/)
              if (jsonBlockMatch) {
                content = jsonBlockMatch[1].trim()
              }
              /* ``` 없이 순수 JSON이면 앞뒤 공백만 제거 */
              content = content.trim()

              try {
                const parsed: BriefingResponse = JSON.parse(content)
                setBriefingCards(parsed.cards)
                setBriefingSummary(parsed.summary)
              } catch {
                /* JSON 파싱 실패 시 — accumulated에서 다시 시도 */
                try {
                  let fallback = accumulated.trim()
                  const fallbackMatch = fallback.match(/```json\s*([\s\S]*?)```/)
                  if (fallbackMatch) fallback = fallbackMatch[1].trim()

                  const parsed2: BriefingResponse = JSON.parse(fallback)
                  setBriefingCards(parsed2.cards)
                  setBriefingSummary(parsed2.summary)
                } catch {
                  /* 최종 실패 시 텍스트를 1장 카드로 표시 */
                  setBriefingCards([{ title: '경영 브리핑', content: accumulated }])
                }
              }
              setStreamingText('')
            } else if (event.type === 'error') {
              setError(event.content)
            }
          } catch {
            /* 불완전한 청크 무시 */
          }
        }
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    }

    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      {/* ── 페이지 헤더 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">AI 브리핑</h1>
          <p className="mt-2 text-on-surface-variant">AI가 데이터를 분석하여 주간 경영 브리핑을 생성합니다</p>
        </div>
        <Link
          href="/briefing/archive"
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <Archive size={16} />
          아카이브
        </Link>
      </div>

      {/* ── 브리핑 생성 컨트롤러 ── */}
      <BriefingGenerator
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasData={salesData.length > 0}
      />

      {/* ── 에러 메시지 ── */}
      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* ── 스트리밍 중 타이핑 효과 표시 ── */}
      {isGenerating && streamingText && (
        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
              AI 분석 중
            </span>
          </div>
          <p className="text-on-surface leading-relaxed text-base">
            {streamingText}
            <span className="animate-pulse text-primary ml-1">▌</span>
          </p>
        </div>
      )}

      {/* ── 생성 중 스켈레톤 (텍스트가 아직 없을 때) ── */}
      {isGenerating && !streamingText && (
        <div className="rounded-xl bg-surface-container p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-on-surface-variant">데이터를 수집하고 있습니다...</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-surface-container-high animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-surface-container-high animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-surface-container-high animate-pulse" />
          </div>
        </div>
      )}

      {/* ── 완성된 6장 카드 캐러셀 ── */}
      {!isGenerating && briefingCards.length > 0 && (
        <BriefingCards cards={briefingCards} summary={briefingSummary} />
      )}
    </div>
  )
}
