'use client'

import Link from 'next/link'

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = '',
}) {
  return (
    <section
      className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8 lg:mb-10 ${className}`}
    >
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-[12px] text-on-surface-variant/60 mb-2 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-on-surface transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      idx === breadcrumbs.length - 1
                        ? 'text-on-surface font-bold'
                        : ''
                    }
                  >
                    {crumb.label}
                  </span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="material-symbols-outlined text-[14px]">
                    chevron_right
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-on-surface-variant/70 text-body-md mt-1.5">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 lg:flex-shrink-0">
          {actions}
        </div>
      )}
    </section>
  )
}
