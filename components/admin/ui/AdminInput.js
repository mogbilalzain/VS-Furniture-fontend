'use client'

import { forwardRef } from 'react'

const AdminInput = forwardRef(function AdminInput(
  {
    label,
    error,
    hint,
    icon,
    leftIcon,
    rightIcon,
    className = '',
    wrapperClassName = '',
    id,
    type = 'text',
    ...rest
  },
  ref
) {
  const inputId = id || (label ? `inp-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const iconLeft = icon || leftIcon

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px] pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full bg-surface-container-lowest border rounded-xl py-2.5 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
            iconLeft ? 'pl-10' : 'pl-4'
          } ${rightIcon ? 'pr-10' : 'pr-4'} ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/30'
              : 'border-outline-variant/40 focus:border-on-surface focus:ring-2 focus:ring-primary-container/40'
          } ${className}`}
          {...rest}
        />
        {rightIcon && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px] pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="text-[12px] text-on-surface-variant/60">{hint}</p>
      )}
      {error && <p className="text-[12px] text-error font-medium">{error}</p>}
    </div>
  )
})

export default AdminInput
