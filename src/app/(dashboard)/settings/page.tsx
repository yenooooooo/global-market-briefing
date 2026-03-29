/**
 * (dashboard)/settings/page.tsx — 설정 페이지 (국가/법인 관리)
 *
 * 해외 법인 국가를 추가, 조회, 삭제하는 설정 페이지입니다.
 *
 * 기능:
 * 1. 국가 추가: 이름, 국가 코드, 통화 선택 폼
 * 2. 국가 목록: 등록된 법인 리스트 (국기 이모지 포함)
 * 3. 국가 삭제: 확인 모달 후 삭제 (연관 매출 데이터도 CASCADE 삭제)
 * 4. 프리셋 버튼: "기본 설정" 클릭 시 7개국 자동 생성
 *
 * 디자인:
 * - surface-container 배경 카드
 * - 미니멀 언더라인 인풋
 * - Ghost Border 리스트 아이템
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PRESET_COUNTRIES, countryCodeToFlag, CURRENCY_SYMBOLS } from '@/lib/constants/countries'
import type { Country } from '@/types'

export default function SettingsPage() {
  const [countries, setCountries] = useState<Country[]>([])  // 등록된 국가 목록
  const [isLoading, setIsLoading] = useState(true)           // 데이터 로딩 상태
  const [isSaving, setIsSaving] = useState(false)            // 저장 중 상태

  /* ── 국가 추가 폼 상태 ── */
  const [newName, setNewName] = useState('')       // 국가 한글명
  const [newCode, setNewCode] = useState('')       // 국가 코드
  const [newCurrency, setNewCurrency] = useState('') // 통화 코드

  /* ── 삭제 확인 모달 상태 ── */
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null)

  /* ── 에러/성공 메시지 ── */
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /**
   * 등록된 국가 목록을 Supabase에서 조회
   *
   * gmb_countries 테이블에서 현재 사용자의 국가 목록을 가져옵니다.
   * RLS 정책에 의해 자동으로 현재 로그인 사용자의 데이터만 반환됩니다.
   */
  const fetchCountries = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('gmb_countries')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('국가 목록 조회 실패:', error)
      return
    }

    setCountries(data || [])
    setIsLoading(false)
  }, [])

  /* 컴포넌트 마운트 시 국가 목록 조회 */
  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  /**
   * 메시지를 3초 후 자동 제거하는 헬퍼
   */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  /**
   * 새 국가 추가 핸들러
   *
   * 입력된 국가 정보를 gmb_countries 테이블에 INSERT합니다.
   * user_id는 RLS에 의해 자동으로 현재 사용자로 설정됩니다.
   */
  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newCode || !newCurrency) return

    setIsSaving(true)
    const supabase = createClient()

    /* 현재 로그인 사용자 ID 조회 */
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('gmb_countries')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        code: newCode.toUpperCase().trim(),
        currency: newCurrency.toUpperCase().trim(),
      })

    if (error) {
      showMessage('error', '국가 추가에 실패했습니다.')
      console.error('국가 추가 실패:', error)
    } else {
      showMessage('success', `${newName} 국가가 추가되었습니다.`)
      /* 폼 초기화 */
      setNewName('')
      setNewCode('')
      setNewCurrency('')
      /* 목록 새로고침 */
      fetchCountries()
    }
    setIsSaving(false)
  }

  /**
   * 국가 삭제 핸들러
   *
   * 선택된 국가를 gmb_countries에서 DELETE합니다.
   * ON DELETE CASCADE에 의해 연관된 매출 데이터도 자동 삭제됩니다.
   */
  const handleDeleteCountry = async () => {
    if (!deleteTarget) return

    const supabase = createClient()
    const { error } = await supabase
      .from('gmb_countries')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      showMessage('error', '국가 삭제에 실패했습니다.')
      console.error('국가 삭제 실패:', error)
    } else {
      showMessage('success', `${deleteTarget.name} 국가가 삭제되었습니다.`)
      fetchCountries()
    }
    setDeleteTarget(null)
  }

  /**
   * 7개국 프리셋 일괄 추가 핸들러
   *
   * PRESET_COUNTRIES 상수에 정의된 7개국을 한번에 INSERT합니다.
   * 이미 등록된 국가(같은 code)는 건너뜁니다.
   */
  const handlePreset = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    /* 이미 등록된 국가 코드 목록 */
    const existingCodes = countries.map((c) => c.code)

    /* 등록되지 않은 국가만 필터링 */
    const newCountries = PRESET_COUNTRIES.filter(
      (preset) => !existingCodes.includes(preset.code)
    )

    if (newCountries.length === 0) {
      showMessage('error', '이미 모든 프리셋 국가가 등록되어 있습니다.')
      setIsSaving(false)
      return
    }

    /* 일괄 INSERT */
    const { error } = await supabase
      .from('gmb_countries')
      .insert(
        newCountries.map((c) => ({
          user_id: user.id,
          name: c.name,
          code: c.code,
          currency: c.currency,
        }))
      )

    if (error) {
      showMessage('error', '프리셋 국가 추가에 실패했습니다.')
      console.error('프리셋 추가 실패:', error)
    } else {
      showMessage('success', `${newCountries.length}개 국가가 추가되었습니다.`)
      fetchCountries()
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* ── 페이지 헤더 ── */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">설정</h1>
        <p className="mt-2 text-on-surface-variant">해외 법인 국가를 관리하세요</p>
      </div>

      {/* ── 알림 메시지 (성공/에러) ── */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-success/10 text-success'
            : 'bg-danger/10 text-danger'
        }`}>
          {message.text}
        </div>
      )}

      {/* ══════════════════════════════════════
         프리셋 버튼 — "기본 설정으로 시작"
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">빠른 설정</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              7개국(미국, 인도, 폴란드, 중국, 일본, 독일, 베트남)을 한번에 추가합니다
            </p>
          </div>
          <button
            onClick={handlePreset}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Zap size={16} />
            기본 설정으로 시작
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
         국가 추가 폼
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-6">국가 추가</h2>
        <form onSubmit={handleAddCountry} className="flex items-end gap-4">
          {/* 국가 한글명 */}
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              국가명
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="미국"
              required
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
            />
          </div>

          {/* 국가 코드 (ISO 3166-1 alpha-2) */}
          <div className="w-24">
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              코드
            </label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="US"
              required
              maxLength={2}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors uppercase"
            />
          </div>

          {/* 통화 코드 */}
          <div className="w-24">
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              통화
            </label>
            <input
              type="text"
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
              placeholder="USD"
              required
              maxLength={3}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors uppercase"
            />
          </div>

          {/* 추가 버튼 */}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-2 text-sm font-medium text-on-surface transition-all hover:bg-surface-bright disabled:opacity-50"
          >
            <Plus size={16} />
            추가
          </button>
        </form>
      </div>

      {/* ══════════════════════════════════════
         등록된 국가 목록
         ══════════════════════════════════════ */}
      <div className="rounded-xl bg-surface-container p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-6">
          등록된 국가 ({countries.length}개)
        </h2>

        {isLoading ? (
          /* 로딩 스켈레톤 */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : countries.length === 0 ? (
          /* 빈 상태 */
          <div className="py-12 text-center">
            <p className="text-on-surface-variant">등록된 국가가 없습니다</p>
            <p className="mt-2 text-sm text-outline">
              위에서 국가를 추가하거나, &quot;기본 설정으로 시작&quot; 버튼을 눌러주세요
            </p>
          </div>
        ) : (
          /* 국가 리스트 */
          <ul className="space-y-2">
            {countries.map((country) => (
              <li
                key={country.id}
                className="flex items-center justify-between rounded-lg bg-surface-container-high px-4 py-3 transition-colors hover:bg-surface-bright"
              >
                <div className="flex items-center gap-4">
                  {/* 국기 이모지 */}
                  <span className="text-2xl">{countryCodeToFlag(country.code)}</span>

                  {/* 국가명 + 코드 */}
                  <div>
                    <span className="font-medium text-on-surface">{country.name}</span>
                    <span className="ml-2 text-xs text-outline">{country.code}</span>
                  </div>

                  {/* 통화 정보 */}
                  <span className="rounded-md bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                    {CURRENCY_SYMBOLS[country.currency] || ''} {country.currency}
                  </span>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => setDeleteTarget(country)}
                  className="rounded-md p-2 text-outline transition-colors hover:bg-danger/10 hover:text-danger"
                  title={`${country.name} 삭제`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ══════════════════════════════════════
         삭제 확인 모달
         ══════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-high p-8 shadow-[var(--shadow-modal)]">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              국가 삭제
            </h3>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
              <span className="font-medium text-on-surface">{deleteTarget.name}</span>을(를) 삭제하면
              해당 국가의 <span className="text-danger font-medium">모든 매출 데이터</span>도 함께 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              {/* 취소 버튼 */}
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright"
              >
                취소
              </button>
              {/* 삭제 확인 버튼 */}
              <button
                onClick={handleDeleteCountry}
                className="rounded-full bg-danger/20 px-5 py-2 text-sm font-bold text-danger transition-all hover:bg-danger/30 active:scale-95"
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
