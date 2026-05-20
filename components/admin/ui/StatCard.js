'use client'

import AdminCard from './AdminCard'

export default function StatCard({
  icon,
  label,
  value,
  change,
  changeType = 'positive',
  loading = false,
  className = '',
}) {
  const changeStyles = {
    positive: 'text-primary',
    negative: 'text-error',
    warning: 'text-on-secondary-fixed-variant',
    neutral: 'text-on-surface-variant/70',
  }

  return (
    <AdminCard className={`flex flex-col ${className}`} padding="p-6 sm:p-7">
      <div className="flex justify-between items-start mb-4">
        {icon ? (
          <span
            className="material-symbols-outlined text-primary p-2.5 bg-primary-container/20 rounded-xl text-[22px]"
            aria-hidden
          >
            {icon}
          </span>
        ) : (
          <span />
        )}
        {change ? (
          <span
            className={`text-[12px] font-bold uppercase tracking-wider ${
              changeStyles[changeType] || changeStyles.neutral
            }`}
          >
            {change}
          </span>
        ) : null}
      </div>
      <p className="text-on-surface-variant/70 text-[12px] font-bold uppercase tracking-[0.1em] mb-1">
        {label}
      </p>
      {loading ? (
        <div className="h-9 w-24 bg-surface-container animate-pulse rounded-lg mt-1" />
      ) : (
        <h3 className="text-on-surface font-bold leading-tight text-[28px] sm:text-[32px] tracking-tight">
          {value}
        </h3>
      )}
    </AdminCard>
  )
}
