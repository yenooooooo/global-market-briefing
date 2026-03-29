/**
 * (dashboard)/sales/upload/page.tsx — 매출 데이터 입력/업로드 페이지
 *
 * 매출 데이터를 수동으로 입력하거나 CSV 업로드하는 페이지입니다.
 * 현재 Phase 3에서는 수동 입력 폼을 구현하고,
 * CSV 업로드는 Phase 3 후반에 추가합니다.
 *
 * 수동 입력 플로우:
 * 1. 국가 선택 (등록된 국가 목록에서 선택)
 * 2. 연도/월 선택
 * 3. 매출(현지통화), 주문건수, 신규고객, 메모 입력
 * 4. "저장" 클릭 → gmb_monthly_sales에 upsert
 * 5. 같은 국가/연도/월이 이미 있으면 업데이트
 *
 * 디자인:
 * - surface-container 배경 카드
 * - 미니멀 언더라인 인풋
 * - 국가 선택은 커스텀 셀렉트 박스
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { countryCodeToFlag, CURRENCY_SYMBOLS } from '@/lib/constants/countries'
import CSVUploader from '@/components/sales/CSVUploader'
import type { Country } from '@/types'

export default function SalesUploadPage() {
  /* ── 국가 목록 (DB에서 조회) ── */
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)

  /* ── 입력 폼 상태 ── */
  const [selectedCountryId, setSelectedCountryId] = useState('')  // 선택된 국가 ID
  const [year, setYear] = useState(new Date().getFullYear())      // 연도 (기본: 올해)
  const [month, setMonth] = useState(new Date().getMonth() + 1)   // 월 (기본: 이번 달)
  const [revenue, setRevenue] = useState('')                       // 매출 (현지통화)
  const [orders, setOrders] = useState('')                         // 주문 건수
  const [newCustomers, setNewCustomers] = useState('')             // 신규 고객 수
  const [memo, setMemo] = useState('')                             // 메모

  /* ── 처리 상태 ── */
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /**
   * 등록된 국가 목록 조회
   */
  const fetchCountries = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('gmb_countries')
      .select('*')
      .order('created_at', { ascending: true })

    setCountries(data || [])
    setIsLoadingCountries(false)

    /* 첫 번째 국가를 기본 선택 */
    if (data && data.length > 0 && !selectedCountryId) {
      setSelectedCountryId(data[0].id)
    }
  }, [selectedCountryId])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  /** 메시지 3초 후 자동 제거 */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  /** 선택된 국가 객체 */
  const selectedCountry = countries.find((c) => c.id === selectedCountryId)

  /**
   * 매출 데이터 저장 핸들러
   *
   * gmb_monthly_sales 테이블에 데이터를 upsert합니다.
   * UNIQUE(user_id, country_id, year, month) 제약으로
   * 같은 국가/연도/월이면 자동으로 UPDATE됩니다.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCountryId || !revenue) return

    setIsSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('gmb_monthly_sales')
      .upsert(
        {
          user_id: user.id,
          country_id: selectedCountryId,
          year,
          month,
          revenue: parseFloat(revenue),
          orders: orders ? parseInt(orders) : null,
          new_customers: newCustomers ? parseInt(newCustomers) : null,
          memo: memo || null,
        },
        {
          /* UNIQUE 제약 조건 컬럼 — 이 조합이 같으면 UPDATE */
          onConflict: 'user_id,country_id,year,month',
        }
      )

    if (error) {
      showMessage('error', '매출 데이터 저장에 실패했습니다.')
      console.error('매출 저장 실패:', error)
    } else {
      showMessage('success', `${selectedCountry?.name} ${year}년 ${month}월 매출이 저장되었습니다.`)
      /* 매출, 주문, 고객, 메모 초기화 (국가/연도/월은 유지) */
      setRevenue('')
      setOrders('')
      setNewCustomers('')
      setMemo('')
    }
    setIsSaving(false)
  }

  /* ── 연도 선택 옵션 (최근 5년) ── */
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  /* ── 월 선택 옵션 (1~12) ── */
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-8">
      {/* ── 페이지 헤더 ── */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">매출 데이터 입력</h1>
        <p className="mt-2 text-on-surface-variant">국가별 월매출 데이터를 입력하세요</p>
      </div>

      {/* ── 알림 메시지 ── */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-success/10 text-success'
            : 'bg-danger/10 text-danger'
        }`}>
          {message.text}
        </div>
      )}

      {/* ── 국가가 없는 경우 안내 ── */}
      {!isLoadingCountries && countries.length === 0 && (
        <div className="rounded-xl bg-surface-container p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-outline" />
          <p className="text-on-surface-variant">등록된 국가가 없습니다</p>
          <p className="mt-2 text-sm text-outline">
            먼저 설정 페이지에서 국가를 추가해주세요
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════
         매출 입력 폼
         ══════════════════════════════════════ */}
      {/* ══════════════════════════════════════
         CSV 파일 업로드
         ══════════════════════════════════════ */}
      {countries.length > 0 && (
        <div className="rounded-xl bg-surface-container p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-6">CSV 파일 업로드</h2>
          <CSVUploader />
        </div>
      )}

      {/* ══════════════════════════════════════
         수동 입력 폼
         ══════════════════════════════════════ */}
      {countries.length > 0 && (
        <form onSubmit={handleSave} className="rounded-xl bg-surface-container p-6 space-y-8">
          <h2 className="font-headline text-lg font-bold text-on-surface">수동 입력</h2>
          {/* ── 국가 선택 탭 ── */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-4">
              국가 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => setSelectedCountryId(country.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedCountryId === country.id
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                  }`}
                >
                  <span>{countryCodeToFlag(country.code)}</span>
                  {country.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── 연도/월 선택 (2컬럼) ── */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
                연도
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface text-sm focus:ring-0 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-surface-container">
                    {y}년
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
                월
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface text-sm focus:ring-0 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m} className="bg-surface-container">
                    {m}월
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── 매출 입력 (필수) ── */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              매출 (현지통화: {selectedCountry ? `${CURRENCY_SYMBOLS[selectedCountry.currency] || ''} ${selectedCountry.currency}` : ''})
            </label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="1,250,000"
              required
              step="0.01"
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 font-headline text-2xl font-bold focus:ring-0 focus:border-primary transition-colors"
            />
          </div>

          {/* ── 주문건수 + 신규고객 (2컬럼) ── */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
                주문 건수 <span className="text-outline/30">(선택)</span>
              </label>
              <input
                type="number"
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                placeholder="48"
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
                신규 고객 수 <span className="text-outline/30">(선택)</span>
              </label>
              <input
                type="number"
                value={newCustomers}
                onChange={(e) => setNewCustomers(e.target.value)}
                placeholder="12"
                className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* ── 메모 ── */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface/40 font-label font-bold mb-2">
              메모 <span className="text-outline/30">(선택)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="CES 참관 효과, 신규 대리점 계약 등"
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-2 px-0 text-on-surface placeholder:text-outline/40 text-sm focus:ring-0 focus:border-primary transition-colors"
            />
          </div>

          {/* ── 저장 버튼 ── */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || !selectedCountryId || !revenue}
              className="flex items-center gap-2 btn-primary-glow px-8 py-3 rounded-full font-headline font-bold text-sm tracking-tight disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save size={16} />
              {isSaving ? '저장 중...' : '매출 데이터 저장'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
