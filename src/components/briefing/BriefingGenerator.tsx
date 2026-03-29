/**
 * components/briefing/BriefingGenerator.tsx — 브리핑 생성 컨트롤러
 *
 * 기간을 선택하고 AI 브리핑 생성을 시작하는 컴포넌트입니다.
 *
 * 기능:
 * - 기간 선택: "이번 주" / "이번 달" / "직접 선택"
 * - "AI 브리핑 생성" 버튼 → SSE 스트리밍 시작
 * - 데이터 부족 시 안내 메시지
 *
 * 디자인:
 * - surface-container 카드
 * - 기간 칩: primary 활성 / surface-container-high 비활성
 * - CTA: 그라데이션 + 글로우 큰 버튼
 */
'use client'

import { useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'

/** 기간 프리셋 옵션 */
type PeriodPreset = 'week' | 'month' | 'quarter' | 'custom'

interface BriefingGeneratorProps {
  onGenerate: (periodStart: string, periodEnd: string, type: string) => void
  isGenerating: boolean   // 현재 생성 중 여부
  hasData: boolean        // 매출 데이터 존재 여부
}

/**
 * 프리셋 기간에 따른 시작/종료일 계산
 *
 * @param preset - 'week' | 'month'
 * @returns { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 */
function getPresetDates(preset: PeriodPreset) {
  const now = new Date()
  const end = now.toISOString().split('T')[0]

  if (preset === 'week') {
    /* 최근 7일 */
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    return { start: start.toISOString().split('T')[0], end }
  }

  if (preset === 'quarter') {
    /* 최근 3개월 */
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    return { start: start.toISOString().split('T')[0], end }
  }

  /* 이번 달 1일 ~ 오늘 */
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: start.toISOString().split('T')[0], end }
}

export default function BriefingGenerator({ onGenerate, isGenerating, hasData }: BriefingGeneratorProps) {
  const [preset, setPreset] = useState<PeriodPreset>('quarter')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  /** 생성 버튼 클릭 핸들러 */
  const handleGenerate = () => {
    let start: string, end: string

    if (preset === 'custom') {
      start = customStart
      end = customEnd
    } else {
      const dates = getPresetDates(preset)
      start = dates.start
      end = dates.end
    }

    if (!start || !end) return

    const type = preset === 'week' ? 'weekly' : 'monthly'
    onGenerate(start, end, type)
  }

  return (
    <div className="rounded-xl bg-surface-container p-6 space-y-6">
      {/* ── 타이틀 ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bot size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">AI 경영 브리핑</h2>
          <p className="text-sm text-on-surface-variant">매출 데이터를 분석하여 인사이트를 생성합니다</p>
        </div>
      </div>

      {/* ── 기간 선택 칩 ── */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-3">
          분석 기간
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'week' as PeriodPreset, label: '이번 주' },
            { key: 'month' as PeriodPreset, label: '이번 달' },
            { key: 'quarter' as PeriodPreset, label: '최근 3개월' },
            { key: 'custom' as PeriodPreset, label: '직접 선택' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                preset === key
                  ? 'bg-primary/15 text-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 직접 선택 시 날짜 입력 ── */}
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              시작일
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              종료일
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ── 데이터 없음 안내 ── */}
      {!hasData && (
        <p className="text-sm text-warning">
          매출 데이터를 먼저 입력해주세요. 데이터가 있어야 브리핑을 생성할 수 있습니다.
        </p>
      )}

      {/* ── 생성 버튼 ── */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !hasData}
        className="w-full flex items-center justify-center gap-3 btn-primary-glow px-8 py-4 rounded-full font-headline font-bold text-base tracking-tight disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Sparkles size={20} />
        {isGenerating ? 'AI가 분석 중입니다...' : 'AI 브리핑 생성'}
      </button>
    </div>
  )
}
