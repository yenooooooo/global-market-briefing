/**
 * components/sales/CSVUploader.tsx — CSV 파일 업로드 컴포넌트
 *
 * 드래그앤드롭 또는 파일 선택으로 CSV를 업로드하고,
 * 미리보기 후 DB에 저장하는 컴포넌트입니다.
 *
 * 플로우:
 * 1. react-dropzone으로 파일 드래그앤드롭 또는 파일 선택
 * 2. papaparse로 CSV 파싱 → 미리보기 테이블 (첫 5행)
 * 3. "업로드" 버튼 클릭 → /api/sales/upload API 호출
 * 4. 결과 표시: "84건 저장 완료"
 *
 * 지원하는 CSV 형식 (CLAUDE.md 참고):
 * 국가,연도,월,매출(현지통화),주문건수,신규고객수,메모
 *
 * 디자인:
 * - surface-container-high 드롭존 (대시 보더)
 * - 미리보기 테이블은 surface-container 배경
 */
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'
import type { CSVSalesRow } from '@/types'

/** CSV 파싱 결과 행 타입 (papaparse 원본) */
interface RawCSVRow {
  [key: string]: string
}

/**
 * CSV 헤더 자동 매핑
 *
 * 한글/영문 헤더를 표준 필드명으로 변환합니다.
 * 예: '국가' → 'country', '매출(현지통화)' → 'revenue'
 */
const HEADER_MAP: Record<string, keyof CSVSalesRow> = {
  '국가': 'country',
  'country': 'country',
  '연도': 'year',
  'year': 'year',
  '월': 'month',
  'month': 'month',
  '매출': 'revenue',
  '매출(현지통화)': 'revenue',
  'revenue': 'revenue',
  '주문건수': 'orders',
  'orders': 'orders',
  '신규고객수': 'new_customers',
  '신규고객': 'new_customers',
  'new_customers': 'new_customers',
  '메모': 'memo',
  'memo': 'memo',
}

export default function CSVUploader() {
  const [parsedData, setParsedData] = useState<CSVSalesRow[]>([])  // 파싱된 데이터
  const [fileName, setFileName] = useState('')                      // 업로드한 파일명
  const [isUploading, setIsUploading] = useState(false)             // 업로드 중
  const [result, setResult] = useState<{
    success: number; failed: number; errors: string[]
  } | null>(null)

  /**
   * 파일 드롭/선택 핸들러
   *
   * papaparse로 CSV를 파싱하고 헤더를 자동 매핑합니다.
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setResult(null)

    Papa.parse<RawCSVRow>(file, {
      header: true,           // 첫 행을 헤더로 사용
      skipEmptyLines: true,   // 빈 줄 무시
      encoding: 'UTF-8',     // 한국어 CSV 인코딩
      complete: (results) => {
        /* 헤더 매핑: 원본 헤더 → 표준 필드명 */
        const mapped = results.data.map((row) => {
          const mapped: Partial<CSVSalesRow> = {}

          Object.entries(row).forEach(([header, value]) => {
            /* 공백 제거 후 매핑 테이블에서 조회 */
            const cleanHeader = header.trim().toLowerCase()
            const field = HEADER_MAP[header.trim()] || HEADER_MAP[cleanHeader]

            if (field && value) {
              const trimmed = value.trim()
              if (field === 'year' || field === 'month' || field === 'orders' || field === 'new_customers') {
                (mapped as Record<string, unknown>)[field] = parseInt(trimmed) || 0
              } else if (field === 'revenue') {
                /* 콤마 제거 후 숫자 변환 */
                (mapped as Record<string, unknown>)[field] = parseFloat(trimmed.replace(/,/g, '')) || 0
              } else {
                (mapped as Record<string, unknown>)[field] = trimmed
              }
            }
          })

          return mapped as CSVSalesRow
        }).filter((row) => row.country && row.year && row.month && row.revenue)

        setParsedData(mapped)
      },
    })
  }, [])

  /* react-dropzone 설정 */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  /**
   * DB 업로드 핸들러
   *
   * 파싱된 데이터를 /api/sales/upload API로 전송합니다.
   */
  const handleUpload = async () => {
    setIsUploading(true)
    try {
      const res = await fetch('/api/sales/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedData }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
      } else {
        setResult({ success: 0, failed: parsedData.length, errors: [data.message] })
      }
    } catch {
      setResult({ success: 0, failed: parsedData.length, errors: ['네트워크 오류가 발생했습니다.'] })
    }
    setIsUploading(false)
  }

  /**
   * 샘플 CSV 다운로드
   *
   * 7개국 × 3개월 데모 데이터가 포함된 CSV를 다운로드합니다.
   */
  const handleSampleDownload = () => {
    const csv = `국가,연도,월,매출(현지통화),주문건수,신규고객수,메모
미국,2025,1,1250000,48,12,CES 참관 효과
미국,2025,2,1300000,52,15,
미국,2025,3,1180000,45,10,
인도,2025,1,85000000,62,28,신규 대리점 계약
인도,2025,2,92000000,68,32,
인도,2025,3,78000000,55,22,
폴란드,2025,1,420000,15,3,
폴란드,2025,2,450000,18,5,
폴란드,2025,3,380000,12,2,
중국,2025,1,3200000,38,8,춘절 영향
중국,2025,2,2800000,32,6,
중국,2025,3,3500000,42,11,
일본,2025,1,18500000,22,5,
일본,2025,2,19200000,25,7,
일본,2025,3,17800000,20,4,
독일,2025,1,380000,14,4,
독일,2025,2,410000,16,5,
독일,2025,3,395000,15,3,
베트남,2025,1,2800000000,85,35,
베트남,2025,2,3100000000,92,40,
베트남,2025,3,2650000000,78,30,`

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_sales_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* ── 샘플 CSV 다운로드 ── */}
      <div className="flex justify-end">
        <button
          onClick={handleSampleDownload}
          className="flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
        >
          <Download size={14} />
          샘플 CSV 다운로드
        </button>
      </div>

      {/* ══════════════════════════════════════
         드래그앤드롭 영역
         ══════════════════════════════════════ */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant/30 bg-surface-container-high hover:border-outline'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={40} className={isDragActive ? 'text-primary' : 'text-outline'} />
        <p className="mt-4 text-on-surface font-medium">
          {isDragActive ? 'CSV 파일을 놓아주세요' : 'CSV 파일을 드래그하거나 클릭하여 선택'}
        </p>
        <p className="mt-2 text-sm text-outline">
          .csv 파일만 지원 (UTF-8 인코딩)
        </p>
      </div>

      {/* ══════════════════════════════════════
         미리보기 테이블 (파싱된 데이터 첫 5행)
         ══════════════════════════════════════ */}
      {parsedData.length > 0 && !result && (
        <div className="rounded-xl bg-surface-container p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-primary" />
              <span className="font-medium text-on-surface">{fileName}</span>
              <span className="text-sm text-on-surface-variant">({parsedData.length}건)</span>
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 btn-primary-glow px-6 py-2.5 rounded-full font-headline font-bold text-sm disabled:opacity-50"
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </button>
          </div>

          {/* 미리보기 테이블 — 최대 5행 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-widest text-on-surface-variant font-label">국가</th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-widest text-on-surface-variant font-label">연도</th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-widest text-on-surface-variant font-label">월</th>
                  <th className="px-3 py-2 text-right text-xs uppercase tracking-widest text-on-surface-variant font-label">매출</th>
                  <th className="px-3 py-2 text-right text-xs uppercase tracking-widest text-on-surface-variant font-label">주문</th>
                  <th className="px-3 py-2 text-right text-xs uppercase tracking-widest text-on-surface-variant font-label">신규고객</th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-widest text-on-surface-variant font-label">메모</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-high'}>
                    <td className="px-3 py-2 text-on-surface">{row.country}</td>
                    <td className="px-3 py-2 text-on-surface">{row.year}</td>
                    <td className="px-3 py-2 text-on-surface">{row.month}</td>
                    <td className="px-3 py-2 text-right font-headline font-medium text-on-surface">
                      {row.revenue.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-on-surface-variant">{row.orders || '—'}</td>
                    <td className="px-3 py-2 text-right text-on-surface-variant">{row.new_customers || '—'}</td>
                    <td className="px-3 py-2 text-on-surface-variant text-xs">{row.memo || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 5 && (
            <p className="text-xs text-outline text-center">... 외 {parsedData.length - 5}건</p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
         업로드 결과
         ══════════════════════════════════════ */}
      {result && (
        <div className="rounded-xl bg-surface-container p-6 space-y-3">
          <div className="flex items-center gap-3">
            {result.failed === 0 ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <AlertCircle size={20} className="text-warning" />
            )}
            <span className="font-headline font-bold text-on-surface">
              업로드 완료
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            <span className="text-success font-medium">{result.success}건 성공</span>
            {result.failed > 0 && (
              <span className="text-danger font-medium ml-3">{result.failed}건 실패</span>
            )}
          </p>
          {result.errors.length > 0 && (
            <ul className="space-y-1">
              {result.errors.map((err, idx) => (
                <li key={idx} className="text-xs text-danger">{err}</li>
              ))}
            </ul>
          )}
          {/* 새 파일 업로드 버튼 */}
          <button
            onClick={() => { setParsedData([]); setResult(null); setFileName('') }}
            className="mt-2 text-sm text-primary hover:underline underline-offset-4"
          >
            다른 파일 업로드
          </button>
        </div>
      )}
    </div>
  )
}
