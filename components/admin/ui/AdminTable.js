'use client'

import AdminCard from './AdminCard'

export function AdminTable({ children, className = '' }) {
  return (
    <AdminCard padding="p-0" className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">{children}</table>
      </div>
    </AdminCard>
  )
}

export function AdminTHead({ children, className = '' }) {
  return (
    <thead className={className}>
      <tr className="border-b border-surface-container">{children}</tr>
    </thead>
  )
}

export function AdminTH({ children, className = '', align = 'left', ...rest }) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return (
    <th
      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 ${
        alignClasses[align] || ''
      } ${className}`}
      {...rest}
    >
      {children}
    </th>
  )
}

export function AdminTBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-surface-container ${className}`}>{children}</tbody>
}

export function AdminTR({ children, className = '', hoverable = true, ...rest }) {
  return (
    <tr
      className={`${hoverable ? 'hover:bg-surface-container-low/50 transition-colors' : ''} ${className}`}
      {...rest}
    >
      {children}
    </tr>
  )
}

export function AdminTD({ children, className = '', align = 'left', ...rest }) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return (
    <td
      className={`px-6 py-4 text-[14px] text-on-surface ${alignClasses[align] || ''} ${className}`}
      {...rest}
    >
      {children}
    </td>
  )
}

export default AdminTable
