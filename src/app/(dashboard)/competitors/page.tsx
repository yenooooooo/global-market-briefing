/**
 * (dashboard)/competitors/page.tsx — 경쟁사 메모 페이지
 *
 * 경쟁사 관련 정보를 수동으로 기록하고 관리하는 페이지입니다.
 * 여기서 입력한 메모는 AI 브리핑 생성 시 자동으로 프롬프트에 포함됩니다.
 *
 * 기능:
 * 1. 메모 입력: 경쟁사 이름, 내용, 출처 URL, 날짜
 * 2. 목록 표시: 최신순 타임라인 형태
 * 3. 삭제 기능
 *
 * 디자인:
 * - 상단에 항상 입력 폼 노출
 * - 타임라인 형식 리스트 (좌측 라인 + 날짜 배지)
 * - surface-container 카드
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ExternalLink, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDateKR } from '@/lib/utils/format'
import type { CompetitorNote } from '@/types'

export default function CompetitorsPage() {
  const [notes, setNotes] = useState<CompetitorNote[]>([])  // 메모 목록
  const [isLoading, setIsLoading] = useState(true)

  /* ── 입력 폼 상태 ── */
  const [name, setName] = useState('')       // 경쟁사 이름
  const [note, setNote] = useState('')       // 메모 내용
  const [source, setSource] = useState('')   // 출처 URL
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /**
   * 메모 목록 조회 (최신순)
   */
  const fetchNotes = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('gmb_competitor_notes')
      .select('*')
      .order('noted_at', { ascending: false })
      .order('created_at', { ascending: false })

    setNotes(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  /** 메시지 3초 후 자동 제거 */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  /**
   * 메모 추가 핸들러
   */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !note.trim()) return

    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('gmb_competitor_notes')
      .insert({
        user_id: user.id,
        competitor_name: name.trim(),
        note: note.trim(),
        source: source.trim() || null,
      })

    if (error) {
      showMessage('error', '메모 저장에 실패했습니다.')
    } else {
      showMessage('success', '경쟁사 메모가 저장되었습니다.')
      setName('')
      setNote('')
      setSource('')
      fetchNotes()
    }
    setIsSaving(false)
  }

  /**
   * 메모 삭제 핸들러
   */
  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('gmb_competitor_notes').delete().eq('id', id)
    fetchNotes()
  }

  return (
    <div className="space-y-6">
      {/* ── 페이지 헤더 ── */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">경쟁사 메모</h1>
        <p className="mt-2 text-on-surface-variant">경쟁사 동향을 기록하면 AI 브리핑에 자동 반영됩니다</p>
      </div>

      {/* ── 알림 메시지 ── */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {message.text}
        </div>
      )}

      {/* ══════════════════════════════════════
         메모 입력 폼
         ══════════════════════════════════════ */}
      <form onSubmit={handleAdd} className="rounded-xl bg-surface-container p-6 space-y-6">
        <h2 className="font-headline text-lg font-bold text-on-surface">새 메모 작성</h2>

        {/* 경쟁사 이름 + 출처 URL (2컬럼) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              경쟁사 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="삼성, LG, 보쉬 등"
              required
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              출처 URL <span className="text-outline/30">(선택)</span>
            </label>
            <input
              type="url"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* 메모 내용 */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
            메모 내용
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="경쟁사 동향, 신제품 출시, 가격 변동, 시장 점유율 등"
            required
            rows={3}
            className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-full bg-surface-container-high px-6 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-bright transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          {isSaving ? '저장 중...' : '메모 추가'}
        </button>
      </form>

      {/* ══════════════════════════════════════
         메모 타임라인 리스트
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-6">
          메모 기록 ({notes.length}건)
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 size={32} className="mx-auto mb-3 text-outline" />
            <p className="text-on-surface-variant text-sm">아직 경쟁사 메모가 없습니다</p>
          </div>
        ) : (
          /* 타임라인 리스트 */
          <div className="relative space-y-4">
            {/* 좌측 세로 라인 */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/20" />

            {notes.map((item) => (
              <div key={item.id} className="relative pl-10 group">
                {/* 타임라인 도트 */}
                <div className="absolute left-[11px] top-4 h-3 w-3 rounded-full bg-surface-container-high ring-2 ring-outline-variant/30 group-hover:ring-primary/50 transition-colors" />

                <div className="rounded-lg bg-surface-container-high p-4 hover:bg-surface-bright transition-colors">
                  {/* 상단: 경쟁사 이름 + 날짜 + 삭제 */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-headline font-bold text-on-surface">
                        {item.competitor_name}
                      </span>
                      <span className="ml-3 text-xs text-outline">
                        {formatDateKR(item.noted_at, 'short')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-outline hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* 메모 내용 */}
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                    {item.note}
                  </p>

                  {/* 출처 링크 */}
                  {item.source && (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
                    >
                      <ExternalLink size={12} />
                      출처 보기
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
