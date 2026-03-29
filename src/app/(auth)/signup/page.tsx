/**
 * (auth)/signup/page.tsx — 회원가입 페이지
 *
 * stitch (10) 디자인을 정확히 재현한 회원가입 페이지입니다.
 *
 * stitch (10) 동일 요소:
 * - 12컬럼 비대칭 레이아웃 (5:7)
 * - bg-surface-container-low 폼 카드 + 블루 글로우
 * - primary 바 + text-3xl 헤더
 * - 2컬럼 인풋 그리드 (grid-cols-2 gap-10)
 * - gradient 버튼 + 블루 글로우 쉐도우
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, company: company || null },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('이미 가입된 이메일입니다.')
        } else if (authError.message.includes('Password should be')) {
          setError('비밀번호는 6자 이상이어야 합니다.')
        } else {
          setError('회원가입 중 오류가 발생했습니다.')
        }
        return
      }

      setIsSuccess(true)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── 가입 성공 화면 ── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-surface-container-low rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary font-headline text-3xl font-bold">✓</span>
            </div>
            <h2 className="font-headline text-3xl font-bold text-white tracking-tight">이메일을 확인해주세요</h2>
            <p className="mt-6 text-on-surface-variant leading-relaxed text-lg">
              <span className="text-primary font-medium">{email}</span>으로 확인 메일을 보냈습니다.
              메일의 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <Link href="/login" className="mt-8 inline-block text-primary font-headline font-bold text-lg hover:underline underline-offset-4">
              로그인 페이지로 이동 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 md:px-12">
      <div className="w-full max-w-screen-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">

        {/* ── 좌측: 헤딩 ── */}
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-6 text-white">
            새로운 시작을<br /><span className="text-primary">함께.</span>
          </h1>
          <p className="text-on-surface-variant text-base lg:text-lg max-w-md font-light leading-relaxed">
            글로벌 마켓 브리핑에 가입하고 AI 기반 해외 시장 분석을 경험하세요.
          </p>
        </div>

        {/* ── 우측: 회원가입 폼 ── */}
        <div className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-2xl relative overflow-hidden order-1 lg:order-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />

          <h2 className="font-headline font-bold text-3xl mb-12 text-white flex items-center gap-4 relative z-10">
            <span className="w-8 h-[2px] bg-primary" /> 회원가입
          </h2>

          <form onSubmit={handleSignup} className="space-y-10 relative z-10">
            {/* 이름 + 회사명 (2컬럼 — stitch 동일 gap-10) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-bold mb-4">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  required
                  className="w-full bg-transparent border-0 border-b border-outline/20 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-white placeholder:text-on-surface/20 text-lg"
                />
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-bold mb-4">
                  회사명 <span className="text-on-surface/20">(선택)</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="회사명 입력"
                  className="w-full bg-transparent border-0 border-b border-outline/20 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-white placeholder:text-on-surface/20 text-lg"
                />
              </div>
            </div>

            {/* 이메일 + 비밀번호 (2컬럼) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                  placeholder="6자 이상"
                  required
                  minLength={6}
                  className="w-full bg-transparent border-0 border-b border-outline/20 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-white placeholder:text-on-surface/20 text-lg"
                />
              </div>
            </div>

            {error && (
              <p className="text-danger text-sm font-medium">{error}</p>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black px-12 py-5 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0px_20px_40px_rgba(0,82,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? '가입 처리 중...' : '회원가입'}
                <span className="text-xl">→</span>
              </button>
            </div>
          </form>

          <p className="relative z-10 mt-10 text-sm text-on-surface-variant">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
