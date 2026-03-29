/**
 * (dashboard)/briefing/archive/page.tsx — 브리핑 아카이브 페이지
 *
 * 과거에 생성된 AI 브리핑들을 날짜순으로 목록 표시하고,
 * 클릭하면 해당 브리핑 카드를 다시 볼 수 있는 페이지입니다.
 *
 * 기능:
 * - 과거 브리핑 목록 (최신순 정렬)
 * - 각 항목 클릭 시 해당 브리핑 카드 6장 다시 보기
 * - 삭제 기능
 *
 * 디자인:
 * - 리스트 아이템: surface-container / surface-container-high 교대
 * - 선택된 항목: primary 하이라이트
 * - 삭제 확인 모달
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Calendar, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BriefingCards from '@/components/briefing/BriefingCards'
import type { Briefing, BriefingResponse, BriefingCard } from '@/types'
import { formatDateKR } from '@/lib/utils/format'

export default function BriefingArchivePage() {
  const [briefings, setBriefings] = useState<Briefing[]>([])      // 브리핑 목록
  const [isLoading, setIsLoading] = useState(true)                  // 로딩 상태
  const [selectedId, setSelectedId] = useState<string | null>(null) // 선택된 브리핑 ID
  const [deleteTarget, setDeleteTarget] = useState<Briefing | null>(null) // 삭제 대상

  /**
   * 브리핑 목록 조회
   * gmb_briefings 테이블에서 최신순으로 조회합니다.
   */
  const fetchBriefings = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('gmb_briefings')
      .select('*')
      .order('created_at', { ascending: false })

    setBriefings(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchBriefings()
  }, [fetchBriefings])

  /**
   * 브리핑 삭제 핸들러
   */
  const handleDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('gmb_briefings').delete().eq('id', deleteTarget.id)

    /* 선택된 브리핑이 삭제된 것이면 선택 해제 */
    if (selectedId === deleteTarget.id) setSelectedId(null)
    setDeleteTarget(null)
    fetchBriefings()
  }

  /**
   * 선택된 브리핑의 카드 데이터를 파싱
   *
   * content 필드에 저장된 JSON 문자열을 BriefingResponse로 파싱합니다.
   * 파싱 실패 시 전체 텍스트를 1장 카드로 반환합니다.
   */
  const getSelectedCards = (): { cards: BriefingCard[]; summary: string } => {
    const selected = briefings.find((b) => b.id === selectedId)
    if (!selected) return { cards: [], summary: '' }

    /*
     * DB에 저장된 content를 파싱
     * Claude가 ```json 블록으로 감쌀 수 있으므로 정리 후 파싱
     */
    let content = selected.content.trim()

    /* ```json ... ``` 블록 제거 */
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      content = jsonBlockMatch[1].trim()
    }

    try {
      const parsed: BriefingResponse = JSON.parse(content)
      return { cards: parsed.cards, summary: parsed.summary }
    } catch {
      return { cards: [{ title: '경영 브리핑', content: selected.content }], summary: '' }
    }
  }

  const { cards, summary } = selectedId ? getSelectedCards() : { cards: [], summary: '' }

  return (
    <div className="space-y-6">
      {/* ── 페이지 헤더 ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/briefing"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">브리핑 아카이브</h1>
          <p className="mt-1 text-on-surface-variant text-sm">과거 AI 브리핑을 다시 확인하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ══════════════════════════════════════
           좌측: 브리핑 목록
           ══════════════════════════════════════ */}
        <div className="lg:col-span-4">
          <div className="rounded-xl bg-surface-container p-4 space-y-1">
            {isLoading ? (
              /* 로딩 스켈레톤 */
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-surface-container-high animate-pulse" />
                ))}
              </div>
            ) : briefings.length === 0 ? (
              /* 빈 상태 */
              <div className="py-12 text-center">
                <FileText size={32} className="mx-auto mb-3 text-outline" />
                <p className="text-on-surface-variant text-sm">아직 생성된 브리핑이 없습니다</p>
              </div>
            ) : (
              /* 브리핑 목록 */
              briefings.map((briefing) => (
                <div
                  key={briefing.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                    selectedId === briefing.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                  onClick={() => setSelectedId(briefing.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Calendar size={14} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {formatDateKR(briefing.period_start, 'short')} ~ {formatDateKR(briefing.period_end, 'short')}
                      </p>
                      <p className="text-xs text-outline mt-0.5">
                        {briefing.briefing_type === 'weekly' ? '주간' : '월간'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(briefing) }}
                    className="shrink-0 p-1 rounded text-outline hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════
           우측: 선택된 브리핑 카드 표시
           ══════════════════════════════════════ */}
        <div className="lg:col-span-8">
          {selectedId && cards.length > 0 ? (
            <BriefingCards cards={cards} summary={summary} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-surface-container">
              <p className="text-on-surface-variant text-sm">
                좌측 목록에서 브리핑을 선택하세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-high p-8 shadow-[var(--shadow-modal)]">
            <h3 className="font-headline text-lg font-bold text-on-surface">브리핑 삭제</h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              이 브리핑을 삭제하시겠습니까? 삭제된 브리핑은 복구할 수 없습니다.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface hover:bg-surface-bright"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full bg-danger/20 px-5 py-2 text-sm font-bold text-danger hover:bg-danger/30 active:scale-95 transition-all"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
