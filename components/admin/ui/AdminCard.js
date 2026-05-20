'use client'

export default function AdminCard({
  children,
  className = '',
  padding = 'p-6 sm:p-8',
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={`relative bg-surface-container-lowest rounded-[20px] admin-shadow-soft border border-outline-variant/10 ${padding} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
