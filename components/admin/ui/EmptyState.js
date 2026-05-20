'use client'

import AdminCard from './AdminCard'

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}) {
  return (
    <AdminCard className={`text-center ${className}`} padding="p-10 sm:p-14">
      <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-on-surface-variant text-[32px]">
          {icon}
        </span>
      </div>
      <h3 className="text-headline-md font-bold text-on-surface mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-on-surface-variant/70 text-body-md max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {action}
    </AdminCard>
  )
}
