'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../../lib/localStorage-utils'
import {
  AdminCard,
  AdminButton,
  AdminSelect,
  StatCard,
  PageHeader,
} from '../../../components/admin/ui'

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
]

const REPORTS = [
  { value: 'sales', label: 'Sales Report' },
  { value: 'products', label: 'Products Report' },
  { value: 'customers', label: 'Customers Report' },
  { value: 'inventory', label: 'Inventory Report' },
]

const SEGMENTED_PERIODS = [
  { value: 'week', label: '7D' },
  { value: 'month', label: '30D' },
  { value: 'quarter', label: '90D' },
  { value: 'year', label: '1Y' },
]

const ReportsPage = () => {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState('sales')

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login')
    }
  }, [router])

  const topProducts = [
    { name: 'Ergonomic Chair', sales: 125, revenue: 18750 },
    { name: 'Shift+ Table', sales: 98, revenue: 14700 },
    { name: 'Storage Unit', sales: 76, revenue: 11400 },
    { name: 'Executive Desk', sales: 65, revenue: 9750 },
  ]

  const customerData = [
    { category: 'New Customers', count: 45, percentage: 25 },
    { category: 'Returning Customers', count: 89, percentage: 50 },
    { category: 'VIP Customers', count: 23, percentage: 13 },
    { category: 'Inactive Customers', count: 21, percentage: 12 },
  ]

  const exportReport = () => {
    alert('Exporting report...')
  }

  const generateReport = () => {
    alert('Generating report...')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: 'Performance' },
          { label: 'Reports & Analytics' },
        ]}
        title="Reports &amp; Analytics"
        description="View detailed business performance and customer insights."
        actions={
          <>
            <div className="hidden lg:flex bg-surface-container p-1 rounded-xl">
              {SEGMENTED_PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSelectedPeriod(p.value)}
                  className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${
                    selectedPeriod === p.value
                      ? 'bg-surface-container-lowest text-on-surface admin-shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <AdminButton variant="secondary" icon="insights" size="lg" onClick={generateReport}>
              Generate
            </AdminButton>
            <AdminButton variant="primary" icon="file_download" size="lg" onClick={exportReport}>
              Export
            </AdminButton>
          </>
        }
      />

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminSelect
            label="Time Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={PERIODS}
          />
          <AdminSelect
            label="Report Type"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            options={REPORTS}
          />
        </div>
      </AdminCard>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          icon="payments"
          label="Total Sales"
          value="$126,000"
          change="+18.4%"
          changeType="positive"
        />
        <StatCard
          icon="shopping_cart"
          label="Total Orders"
          value="364"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon="group"
          label="Total Customers"
          value="178"
          change="+8%"
          changeType="positive"
        />
        <StatCard
          icon="trending_up"
          label="Growth Rate"
          value="15.2%"
          change="Sustained"
          changeType="positive"
        />
      </section>

      {/* Revenue Chart */}
      <AdminCard padding="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-headline-md font-bold text-on-surface">Revenue Trend</h3>
            <p className="text-on-surface-variant/70 text-[14px] mt-1">
              Historical revenue performance over the selected period.
            </p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1">
            <button className="px-4 py-1.5 bg-surface-container-lowest rounded-md text-[12px] font-bold shadow-sm">
              Monthly
            </button>
            <button className="px-4 py-1.5 text-on-surface-variant text-[12px] font-medium hover:text-on-surface">
              Weekly
            </button>
          </div>
        </div>

        {/* Inline SVG Line Chart */}
        <div className="h-[280px] w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="reportChartFill" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffd600', stopOpacity: 0.25 }} />
                <stop offset="100%" style={{ stopColor: '#ffd600', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path
              d="M0,230 Q100,200 200,210 T400,140 T600,90 T800,45 L800,280 L0,280 Z"
              fill="url(#reportChartFill)"
            />
            <path
              d="M0,230 Q100,200 200,210 T400,140 T600,90 T800,45"
              fill="none"
              stroke="#705d00"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <circle cx="800" cy="45" fill="#705d00" r="5" />
          </svg>
          <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[11px] text-on-surface-variant/60">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </AdminCard>

      {/* Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <AdminCard>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-headline-md font-bold text-on-surface">Top Products</h3>
            <span className="text-[12px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
              By Revenue
            </span>
          </div>
          <div className="divide-y divide-surface-container">
            {topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-container/30 flex items-center justify-center text-on-primary-fixed font-bold text-[13px] flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-[14px] truncate">{product.name}</p>
                    <p className="text-on-surface-variant/60 text-[12px]">{product.sales} units sold</p>
                  </div>
                </div>
                <span className="font-bold text-on-surface text-[14px]">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-headline-md font-bold text-on-surface">Customer Analysis</h3>
            <span className="text-[12px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
              Segments
            </span>
          </div>
          <div className="space-y-4">
            {customerData.map((customer, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="font-bold text-on-surface text-[14px]">{customer.category}</p>
                  <span className="font-bold text-on-surface text-[14px]">
                    {customer.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full"
                    style={{ width: `${customer.percentage}%` }}
                  />
                </div>
                <p className="text-on-surface-variant/60 text-[11px] mt-1">
                  {customer.count} customers
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      </section>
    </div>
  )
}

export default ReportsPage
