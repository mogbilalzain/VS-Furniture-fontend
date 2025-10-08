'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth-context'
import { authStorage } from '../../../lib/localStorage-utils'
import { 
  useDashboardStats, 
  useDashboardContentAnalytics, 
  useDashboardChartsData 
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
    // Check if user is logged in and is admin using new system
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Dashboard page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Dashboard page - User is authenticated admin');
    }
  }, [router])

  // Handle real-time updates
  const handleStatsUpdate = (newStats) => {
    setLiveStats(newStats)
  }

  const handleNewActivity = (newActivity) => {
    setLiveActivity(newActivity)
  }

  // Use live stats if available, otherwise use initial data
  const currentStats = liveStats || dashboardData?.data

  // Generate new comprehensive stats
  const stats = (currentStats || dashboardData?.data) ? [
    {
      icon: 'fas fa-box',
      number: currentStats?.totalProducts?.toString() || '0',
      label: 'Total Products',
      color: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#3b82f6',
      change: '+12%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-folder',
      number: currentStats?.totalCategories?.toString() || '0',
      label: 'Categories',
      color: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981',
      change: '+3%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-envelope',
      number: currentStats?.totalMessages?.toString() || '0',
      label: 'Contact Messages',
      color: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#8b5cf6',
      change: '+8%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-certificate',
      number: currentStats?.totalCertifications?.toString() || '0',
      label: 'Certifications',
      color: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#f59e0b',
      change: '+2%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-lightbulb',
      number: currentStats?.totalSolutions?.toString() || '0',
      label: 'Solutions',
      color: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#ef4444',
      change: '+5%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-palette',
      number: currentStats?.totalMaterials?.toString() || '0',
      label: 'Materials',
      color: 'rgba(6, 182, 212, 0.1)',
      iconColor: '#06b6d4',
      change: '+1%',
      changeType: 'positive'
    },
    {
      icon: 'fas fa-users-cog',
      number: currentStats?.adminUsers?.toString() || '0',
      label: 'Admin Users',
      color: 'rgba(132, 204, 22, 0.1)',
      iconColor: '#84cc16',
      change: '0%',
      changeType: 'neutral'
    },
    {
      icon: 'fas fa-heartbeat',
      number: currentStats?.systemHealth?.status === 'healthy' ? '✅' : '⚠️',
      label: 'System Health',
      color: currentStats?.systemHealth?.status === 'healthy' 
        ? 'rgba(16, 185, 129, 0.1)' 
        : 'rgba(245, 158, 11, 0.1)',
      iconColor: currentStats?.systemHealth?.status === 'healthy' ? '#10b981' : '#f59e0b',
      change: currentStats?.systemHealth?.status || 'Unknown',
      changeType: currentStats?.systemHealth?.status === 'healthy' ? 'positive' : 'warning'
    }
  ] : []

  // Use recent data from API (with live updates)
  const recentProducts = currentStats?.recentProducts?.slice(0, 5) || 
    (dashboardData?.success ? (dashboardData.data.recentProducts || []).slice(0, 5) : [])

  const recentMessages = currentStats?.recentMessages?.slice(0, 5) || 
    (dashboardData?.success ? (dashboardData.data.recentMessages || []).slice(0, 5) : [])

  const recentActivity = liveActivity.length > 0 ? liveActivity : 
    (currentStats?.recentActivity?.slice(0, 6) || 
    (dashboardData?.success ? (dashboardData.data.recentActivity || []).slice(0, 6) : []))

  // Show loading state
  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-top-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading comprehensive dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (statsError) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg m-4">
        <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{statsError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="admin-dashboard space-y-6" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your system.</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'actions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Quick Actions
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </p>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  {stat.label}
                </p>
                <div className="flex items-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'text-green-700 bg-green-100' 
                      : stat.changeType === 'warning'
                      ? 'text-yellow-700 bg-yellow-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.color }}
              >
                <i className={stat.icon} style={{ color: stat.iconColor, fontSize: '1.25rem' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
              <Link href="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-gray-500 text-xs">{product.category} • {product.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-yellow-700 bg-yellow-100'
                  }`}>
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <Link href="/admin/contact-messages" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-900 text-sm">{message.from}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.status === 'unread' 
                        ? 'text-blue-700 bg-blue-100' 
                        : message.status === 'read'
                        ? 'text-green-700 bg-green-100'
                        : 'text-purple-700 bg-purple-100'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mb-1">{message.subject}</p>
                  <p className="text-gray-500 text-xs">{message.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className={activity.icon} style={{ fontSize: '0.75rem', color: '#3b82f6' }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* System Health */}
          {dashboardData?.data?.systemHealth && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <SystemHealthChart data={dashboardData.data.systemHealth} loading={statsLoading} />
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <MonthlyActivityChart 
                data={chartsData?.data?.monthlyActivity} 
                loading={chartsLoading} 
              />
            </div>

            {/* Category Distribution Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <CategoryDistributionChart 
                data={chartsData?.data?.categoryDistribution} 
                loading={chartsLoading} 
              />
            </div>

            {/* Content Growth Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <ContentGrowthChart 
                data={chartsData?.data?.contentGrowth} 
                loading={chartsLoading} 
              />
            </div>

            {/* Messages Trend Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <MessagesTrendChart 
                data={chartsData?.data?.messagesTrend} 
                loading={chartsLoading} 
              />
            </div>
          </div>

          {/* Content Analytics */}
          {analyticsData?.success && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData.data.productsWithoutImages}
                  </div>
                  <div className="text-sm text-red-700">Products without Images</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analyticsData.data.emptyCategories}
                  </div>
                  <div className="text-sm text-yellow-700">Empty Categories</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.data.solutionsWithoutProducts}
                  </div>
                  <div className="text-sm text-purple-700">Solutions without Products</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.data.popularCategories?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Popular Categories</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <QuickActions />
      )}

      {/* Real-time Updates Component */}
      <RealTimeUpdates 
        onStatsUpdate={handleStatsUpdate}
        onNewActivity={handleNewActivity}
      />
    </div>
  )
}

export default DashboardPage