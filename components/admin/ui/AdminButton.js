'use client'

import Link from 'next/link'

const VARIANTS = {
  primary:
    'bg-primary-container text-on-primary-fixed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-surface-container-lowest text-on-surface border border-outline-variant/60 hover:bg-surface-container',
  ghost:
    'bg-transparent text-on-surface hover:bg-surface-container-high',
  danger:
    'bg-error-container text-on-error-container hover:brightness-95',
  dark:
    'bg-[#0F0F10] text-primary-container hover:bg-[#1a1a1c]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-5 py-2.5 text-[14px] rounded-xl',
  lg: 'px-6 py-3 text-[14px] rounded-xl',
}

export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  href,
  type = 'button',
  disabled = false,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${
    SIZES[size] || SIZES.md
  } ${VARIANTS[variant] || VARIANTS.primary} ${className}`

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  )
}
