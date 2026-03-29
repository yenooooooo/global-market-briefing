/**
 * (auth)/login/page.tsx — 로그인 페이지
 *
 * stitch (10) 디자인을 정확히 재현한 로그인 페이지입니다.
 *
 * stitch (10) 동일 요소:
 * - bg-surface-container-low 카드 + 블루 글로우 배경 장식
 * - 헤더: w-8 h-[2px] bg-primary 라인 + font-headline text-3xl
 * - 인풋: border-outline/20 언더라인, text-lg, py-3, mb-4 레이블
 * - 버튼: gradient + shadow-[0px_20px_40px_rgba(0,82,255,0.2)]
 * - space-y-10 폼 간격
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.')
        } else {
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
        return
      }

      router.push('/home')
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 md:px-12">
      <div className="w-full max-w-screen-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">

        {/* ── 좌측: 헤딩 — 모바일에서는 작게, 데스크톱에서 크게 ── */}
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-6 text-white">
            다시 오신 것을<br /><span className="text-primary">환영합니다.</span>
          </h1>
          <p className="text-on-surface-variant text-base lg:text-lg max-w-md font-light leading-relaxed">
            글로벌 마켓 브리핑에 로그인하여 해외 법인 매출 현황과 AI 경영 브리핑을 확인하세요.
          </p>
        </div>

        {/* ── 우측: 로그인 폼 카드 ── */}
        <div className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-2xl relative overflow-hidden order-1 lg:order-2">
          {/* 블루 글로우 배경 — stitch 동일 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />

          {/* 헤더 — stitch 동일: primary 바 + 제목 */}
          <h2 className="font-headline font-bold text-3xl mb-12 text-white flex items-center gap-4 relative z-10">
            <span className="w-8 h-[2px] bg-primary" /> 로그인
          </h2>

          {/* 폼 — stitch 동일: space-y-10, border-outline/20 */}
          <form onSubmit={handleLogin} className="space-y-10 relative z-10">
            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-bold mb-4">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-transparent border-0 border-b border-outline/20 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-white placeholder:text-on-surface/20 text-lg"
              />
            </div>

            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-bold mb-4">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-transparent border-0 border-b border-outline/20 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-white placeholder:text-on-surface/20 text-lg"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-danger text-sm font-medium">{error}</p>
            )}

            {/* 버튼 — stitch 동일: gradient + 블루 글로우 쉐도우 */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black px-12 py-5 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0px_20px_40px_rgba(0,82,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? '로그인 중...' : '로그인'}
                <span className="text-xl">→</span>
              </button>
            </div>
          </form>

          {/* 회원가입 링크 */}
          <p className="relative z-10 mt-10 text-sm text-on-surface-variant">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
