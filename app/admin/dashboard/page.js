'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth-context'
import { authStorage } from '../../../lib/localStorage-utils'
import {
  useDashboardStats,
  useDashboardContentAnalytics,
  useDashboardChartsData,
} from '../../../lib/hooks/useDashboard'
import {
  MonthlyActivityChart,
  CategoryDistributionChart,
  ContentGrowthChart,
  MessagesTrendChart,
  SystemHealthChart,
} from '../../../components/admin/DashboardCharts'
import QuickActions from '../../../components/admin/QuickActions'
import RealTimeUpdates from '../../../components/admin/RealTimeUpdates'
import {
  AdminCard,
  StatCard,
  AdminButton,
  AdminBadge,
  PageHeader,
} from '../../../components/admin/ui'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
  { id: 'actions', label: 'Quick Actions', icon: 'bolt' },
]

const DashboardPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { data: dashboardData, loading: statsLoading, error: statsError } = useDashboardStats()
  const { data: analyticsData, loading: analyticsLoading } = useDashboardContentAnalytics()
  const { data: chartsData, loading: chartsLoading } = useDashboardChartsData()

  const [activeTab, setActiveTab] = useState('overview')
  const [liveStats, setLiveStats] = useState(null)
  const [liveActivity, setLiveActivity] = useState([])

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login')
    }
  }, [router])

  const handleStatsUpdate = (newStats) => setLiveStats(newStats)
  const handleNewActivity = (newActivity) => setLiveActivity(newActivity)

  const currentStats = liveStats || dashboardData?.data

  const stats = (currentStats || dashboardData?.data)
    ? [
        {
          icon: 'inventory_2',
          value: currentStats?.totalProducts?.toString() || '0',
          label: 'Total Products',
          change: '+12%',
          changeType: 'positive',
        },
        {
          icon: 'category',
          value: currentStats?.totalCategories?.toString() || '0',
          label: 'Categories',
          change: '+3%',
          changeType: 'positive',
        },
        {
          icon: 'mail',
          value: currentStats?.totalMessages?.toString() || '0',
          label: 'Contact Messages',
          change: '+8%',
          changeType: 'positive',
        },
        {
          icon: 'workspace_premium',
          value: currentStats?.totalCertifications?.toString() || '0',
          label: 'Certifications',
          change: '+2%',
          changeType: 'positive',
        },
        {
          icon: 'lightbulb',
          value: currentStats?.totalSolutions?.toString() || '0',
          label: 'Solutions',
          change: '+5%',
          changeType: 'positive',
        },
        {
          icon: 'palette',
          value: currentStats?.totalMaterials?.toString() || '0',
          label: 'Materials',
          change: '+1%',
          changeType: 'positive',
        },
        {
          icon: 'admin_panel_settings',
          value: currentStats?.adminUsers?.toString() || '0',
          label: 'Admin Users',
          change: 'Stable',
          changeType: 'neutral',
        },
        {
          icon: 'monitor_heart',
          value:
            currentStats?.systemHealth?.status === 'healthy' ? 'OK' : '!',
          label: 'System Health',
          change: currentStats?.systemHealth?.status || 'Unknown',
          changeType:
            currentStats?.systemHealth?.status === 'healthy'
              ? 'positive'
              : 'warning',
        },
      ]
    : []

  const recentProducts =
    currentStats?.recentProducts?.slice(0, 5) ||
    (dashboardData?.success
      ? (dashboardData.data.recentProducts || []).slice(0, 5)
      : [])

  const recentMessages =
    currentStats?.recentMessages?.slice(0, 5) ||
    (dashboardData?.success
      ? (dashboardData.data.recentMessages || []).slice(0, 5)
      : [])

  const recentActivity =
    liveActivity.length > 0
      ? liveActivity
      : currentStats?.recentActivity?.slice(0, 6) ||
        (dashboardData?.success
          ? (dashboardData.data.recentActivity || []).slice(0, 6)
          : [])

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
        <p className="text-on-surface-variant text-body-md">
          Loading dashboard…
        </p>
      </div>
    )
  }

  if (statsError) {
    return (
      <AdminCard className="text-center" padding="p-10">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-error-container text-[28px]">
            error
          </span>
        </div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">
          Error loading dashboard
        </h3>
        <p className="text-on-surface-variant mb-6">{statsError}</p>
        <AdminButton
          onClick={() => window.location.reload()}
          variant="primary"
          icon="refresh"
        >
          Retry
        </AdminButton>
      </AdminCard>
    )
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time performance metrics and business intelligence."
        actions={
          <>
            <AdminButton variant="secondary" icon="file_download" size="lg">
              Export Report
            </AdminButton>
            <AdminButton
              variant="primary"
              icon="add"
              size="lg"
              href="/admin/products"
            >
              New Product
            </AdminButton>
          </>
        }
      />

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-on-surface admin-shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Recent Products */}
          <AdminCard className="lg:col-span-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-headline-md font-bold text-on-surface">
                Recent Products
              </h3>
              <Link
                href="/admin/products"
                className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentProducts.length === 0 ? (
                <p className="text-on-surface-variant/60 text-sm py-4 text-center">
                  No recent products
                </p>
              ) : (
                recentProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-on-surface text-[14px] truncate">
                        {product.name}
                      </p>
                      <p className="text-on-surface-variant/60 text-[12px] truncate">
                        {product.category} • {product.date}
                      </p>
                    </div>
                    <AdminBadge
                      tone={product.status === 'active' ? 'active' : 'pending'}
                      dot
                    >
                      {product.status}
                    </AdminBadge>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          {/* Recent Messages */}
          <AdminCard className="lg:col-span-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-headline-md font-bold text-on-surface">
                Recent Messages
              </h3>
              <Link
                href="/admin/contact-messages"
                className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-on-surface-variant/60 text-sm py-4 text-center">
                  No recent messages
                </p>
              ) : (
                recentMessages.map((message, index) => (
                  <div
                    key={index}
                    className="p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className="font-bold text-on-surface text-[14px] truncate flex-1">
                        {message.from}
                      </p>
                      <AdminBadge
                        tone={
                          message.status === 'unread'
                            ? 'dark'
                            : message.status === 'read'
                            ? 'active'
                            : 'info'
                        }
                      >
                        {message.status}
                      </AdminBadge>
                    </div>
                    <p className="text-on-surface-variant text-[13px] truncate">
                      {message.subject}
                    </p>
                    <p className="text-on-surface-variant/50 text-[11px] mt-1">
                      {message.date}
                    </p>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          {/* Recent Activity */}
          <AdminCard className="lg:col-span-4">
            <h3 className="text-headline-md font-bold text-on-surface mb-5">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-on-surface-variant/60 text-sm py-4 text-center">
                  No recent activity
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl"
                  >
                    <div className="w-9 h-9 bg-primary-container/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i
                        className={activity.icon}
                        style={{ fontSize: '0.875rem', color: '#705d00' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-on-surface">
                        {activity.description}
                      </p>
                      <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </section>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <section className="space-y-gutter">
          {dashboardData?.data?.systemHealth && (
            <AdminCard>
              <SystemHealthChart
                data={dashboardData.data.systemHealth}
                loading={statsLoading}
              />
            </AdminCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <AdminCard>
              <MonthlyActivityChart
                data={chartsData?.data?.monthlyActivity}
                loading={chartsLoading}
              />
            </AdminCard>

            <AdminCard>
              <CategoryDistributionChart
                data={chartsData?.data?.categoryDistribution}
                loading={chartsLoading}
              />
            </AdminCard>

            <AdminCard>
              <ContentGrowthChart
                data={chartsData?.data?.contentGrowth}
                loading={chartsLoading}
              />
            </AdminCard>

            <AdminCard>
              <MessagesTrendChart
                data={chartsData?.data?.messagesTrend}
                loading={chartsLoading}
              />
            </AdminCard>
          </div>

          {analyticsData?.success && (
            <AdminCard>
              <h3 className="text-headline-md font-bold text-on-surface mb-5">
                Content Analytics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-error-container/40 rounded-2xl">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-on-error-container/80">
                    Products without Images
                  </p>
                  <p className="text-3xl font-bold text-on-error-container mt-2">
                    {analyticsData.data.productsWithoutImages}
                  </p>
                </div>
                <div className="p-5 bg-[#fff4cf] rounded-2xl">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#7a5d00]/80">
                    Empty Categories
                  </p>
                  <p className="text-3xl font-bold text-[#7a5d00] mt-2">
                    {analyticsData.data.emptyCategories}
                  </p>
                </div>
                <div className="p-5 bg-secondary-container rounded-2xl">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-on-secondary-container/80">
                    Solutions without Products
                  </p>
                  <p className="text-3xl font-bold text-on-secondary-container mt-2">
                    {analyticsData.data.solutionsWithoutProducts}
                  </p>
                </div>
                <div className="p-5 bg-primary-container/30 rounded-2xl">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-on-primary-fixed/80">
                    Popular Categories
                  </p>
                  <p className="text-3xl font-bold text-on-primary-fixed mt-2">
                    {analyticsData.data.popularCategories?.length || 0}
                  </p>
                </div>
              </div>
            </AdminCard>
          )}
        </section>
      )}

      {/* Quick Actions Tab */}
      {activeTab === 'actions' && <QuickActions />}

      <RealTimeUpdates
        onStatsUpdate={handleStatsUpdate}
        onNewActivity={handleNewActivity}
      />
    </div>
  )
}

export default DashboardPage
