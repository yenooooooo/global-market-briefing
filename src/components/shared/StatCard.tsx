/**
 * components/shared/StatCard.tsx — KPI 숫자 카드
 *
 * stitch 디자인 시스템 적용:
 * - bg-surface-container + border border-outline/5 (stitch 카드 동일)
 * - hover:border-primary/20 transition-all duration-300
 * - p-8 넉넉한 패딩 (stitch p-10 기준 축소)
 * - font-headline text-3xl 큰 숫자
 * - mb-8 아이콘-숫자 간격
 */

import { formatPercent } from '@/lib/utils/format'

interface StatCardProps {
  label: string
  value: string
  change?: number | null
  changeLabel?: string
  icon?: React.ReactNode
}

export default function StatCard({ label, value, change, changeLabel, icon }: StatCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-surface-container border border-outline/5 hover:border-primary/20 transition-all duration-300">
      {/* 상단: 아이콘 */}
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <span className="text-primary">{icon}</span>
        </div>
      )}

      {/* 레이블 */}
      <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label font-bold">
        {label}
      </span>

      {/* 큰 숫자 */}
      <p className="font-headline text-3xl font-bold text-white tracking-tight mt-2 number-display">
        {value}
      </p>

      {/* 증감률 */}
      {change !== undefined && change !== null && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-sm font-bold ${
            change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-outline'
          }`}>
            {formatPercent(change)}
          </span>
          {changeLabel && (
            <span className="text-xs text-outline tracking-wide">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
