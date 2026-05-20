'use client'

const TONES = {
  primary: 'bg-primary-container/20 text-primary',
  success: 'bg-primary-container/30 text-on-primary-fixed',
  active: 'bg-primary-container/20 text-primary',
  pending: 'bg-surface-container text-on-surface-variant',
  inactive: 'bg-surface-container text-on-surface-variant/70',
  neutral: 'bg-surface-container text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
  warning: 'bg-[#fff4cf] text-[#7a5d00]',
  info: 'bg-secondary-container text-on-secondary-container',
  dark: 'bg-[#0F0F10] text-primary-container',
}

export default function AdminBadge({
  children,
  tone = 'info',
  dot = false,
  className = '',
  uppercase = true,
}) {
  const dotColors = {
    primary: 'bg-primary',
    success: 'bg-primary',
    active: 'bg-primary',
    pending: 'bg-on-surface-variant/50',
    inactive: 'bg-on-surface-variant/40',
    neutral: 'bg-on-surface-variant/40',
    error: 'bg-error',
    warning: 'bg-[#b88800]',
    info: 'bg-on-secondary-container',
    dark: 'bg-primary-container',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
        uppercase ? 'uppercase tracking-wider' : 'tracking-tight'
      } ${TONES[tone] || TONES.info} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[tone] || dotColors.info}`} />
      )}
      {children}
    </span>
  )
}
