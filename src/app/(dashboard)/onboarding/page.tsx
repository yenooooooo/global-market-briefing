/**
 * (dashboard)/onboarding/page.tsx — 온보딩 페이지
 *
 * 처음 로그인한 사용자에게 보여지는 초기 설정 페이지입니다.
 * 데모 데이터로 시작할지, 직접 시작할지 선택할 수 있습니다.
 *
 * 플로우:
 * 1. "데모 데이터로 시작하기" → /api/demo/seed 호출 → /home 이동
 * 2. "직접 시작하기" → /settings 이동 (국가 추가부터 시작)
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Settings, Zap, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState('')

  /**
   * 데모 데이터 시딩 핸들러
   * /api/demo/seed API를 호출하여 7개국 + 12개월 데이터를 자동 생성합니다.
   */
  const handleDemoSeed = async () => {
    setIsSeeding(true)
    setError('')

    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' })
      const data = await res.json()

      if (data.skipped) {
        /* 이미 데이터가 있으면 바로 홈으로 */
        router.push('/home')
        return
      }

      if (res.ok) {
        router.push('/home')
      } else {
        setError(data.message || '데모 데이터 생성에 실패했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    }

    setIsSeeding(false)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-lg w-full space-y-8">
        {/* ── 환영 메시지 ── */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            환영합니다!
          </h1>
          <p className="mt-3 text-on-surface-variant leading-relaxed">
            글로벌 마켓 브리핑을 어떻게 시작할까요?
          </p>
        </div>

        {/* ── 에러 메시지 ── */}
        {error && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {/* ── 선택지 2개 ── */}
        <div className="space-y-4">
          {/* 옵션 1: 데모 데이터 */}
          <button
            onClick={handleDemoSeed}
            disabled={isSeeding}
            className="w-full rounded-2xl bg-surface-container p-6 text-left hover:bg-surface-container-high transition-colors group disabled:opacity-50"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-105 transition-transform">
                <Zap size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {isSeeding ? '데이터 생성 중...' : '데모 데이터로 시작하기'}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  7개국 × 12개월 매출 데이터와 경쟁사 메모가 자동으로 채워집니다.
                  대시보드를 바로 체험할 수 있습니다.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium">
                  추천 <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </button>

          {/* 옵션 2: 직접 시작 */}
          <button
            onClick={() => router.push('/settings')}
            className="w-full rounded-2xl bg-surface-container p-6 text-left hover:bg-surface-container-high transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-high group-hover:scale-105 transition-transform">
                <Settings size={22} className="text-on-surface-variant" />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-lg font-bold text-on-surface">직접 시작하기</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  설정 페이지에서 국가를 추가하고, 매출 데이터를 직접 입력합니다.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
