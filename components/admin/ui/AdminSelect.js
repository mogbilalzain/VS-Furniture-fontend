'use client'

import { forwardRef } from 'react'

const AdminSelect = forwardRef(function AdminSelect(
  {
    label,
    error,
    hint,
    options = [],
    className = '',
    wrapperClassName = '',
    id,
    children,
    ...rest
  },
  ref
) {
  const selectId = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none bg-surface-container-lowest border rounded-xl pl-4 pr-10 py-2.5 text-[14px] text-on-surface focus:outline-none transition-all ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/30'
              : 'border-outline-variant/40 focus:border-on-surface focus:ring-2 focus:ring-primary-container/40'
          } ${className}`}
          {...rest}
        >
          {options.length > 0
            ? options.map((opt) =>
                typeof opt === 'string' ? (
                  <option key={opt} value={opt}>{opt}</option>
                ) : (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )
              )
            : children}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px] pointer-events-none">
          expand_more
        </span>
      </div>
      {hint && !error && (
        <p className="text-[12px] text-on-surface-variant/60">{hint}</p>
      )}
      {error && <p className="text-[12px] text-error font-medium">{error}</p>}
    </div>
  )
})

export default AdminSelect
