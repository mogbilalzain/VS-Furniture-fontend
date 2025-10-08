'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../../lib/localStorage-utils'

const ReportsPage = () => {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState('sales')

  useEffect(() => {
    // Check for authentication using new system
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Reports page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Reports page - User is authenticated admin');
    }
  }, [router])

  const salesData = [
    { month: 'Jan', sales: 12000, orders: 45 },
    { month: 'Feb', sales: 15000, orders: 52 },
    { month: 'Mar', sales: 18000, orders: 61 },
    { month: 'Apr', sales: 14000, orders: 48 },
    { month: 'May', sales: 22000, orders: 73 },
    { month: 'Jun', sales: 25000, orders: 85 }
  ]

  const topProducts = [
    { name: 'Ergonomic Chair', sales: 125, revenue: 18750 },
    { name: 'Shift+ Table', sales: 98, revenue: 14700 },
    { name: 'Storage Unit', sales: 76, revenue: 11400 },
    { name: 'Executive Desk', sales: 65, revenue: 9750 }
  ]

  const customerData = [
    { category: 'New Customers', count: 45, percentage: 25 },
    { category: 'Returning Customers', count: 89, percentage: 50 },
    { category: 'VIP Customers', count: 23, percentage: 13 },
    { category: 'Inactive Customers', count: 21, percentage: 12 }
  ]

  const exportReport = () => {
    alert('Exporting report...')
  }

  const generateReport = () => {
    alert('Generating report...')
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#111827',
            margin: 0
          }}>Reports & Analytics</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>View detailed reports and analytics</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button 
            onClick={generateReport}
            style={{
              background: '#3d5c4d',
              color: 'white',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2c2c2c'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#3d5c4d'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <i className="fas fa-chart-line"></i>
            Generate Report
          </button>
          <button 
            onClick={exportReport}
            style={{
              background: '#FFD700',
              color: '#000',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e6c200'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFD700'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <i className="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.875rem',
                width: '150px',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none'
                e.target.style.borderColor = '#FFD700'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.875rem',
                width: '150px',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none'
                e.target.style.borderColor = '#FFD700'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              <option value="sales">Sales Report</option>
              <option value="products">Products Report</option>
              <option value="customers">Customers Report</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                $126,000
              </p>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Total Sales
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-dollar-sign" style={{
                fontSize: '1.25rem',
                color: '#3b82f6'
              }}></i>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                364
              </p>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Total Orders
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-shopping-cart" style={{
                fontSize: '1.25rem',
                color: '#10b981'
              }}></i>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                178
              </p>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Total Customers
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-users" style={{
                fontSize: '1.25rem',
                color: '#f59e0b'
              }}></i>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                15.2%
              </p>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Growth Rate
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-chart-line" style={{
                fontSize: '1.25rem',
                color: '#ef4444'
              }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Top Products */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 1rem 0'
          }}>
            Top Products
          </h3>
          <div>
            {topProducts.map((product, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: index < topProducts.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {product.name}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {product.sales} units sold
                  </p>
                </div>
                <span style={{
                  fontWeight: 600,
                  color: '#10b981'
                }}>
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Analysis */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 1rem 0'
          }}>
            Customer Analysis
          </h3>
          <div>
            {customerData.map((customer, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: index < customerData.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {customer.category}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {customer.count} customers
                  </p>
                </div>
                <span style={{
                  fontWeight: 600,
                  color: '#3b82f6'
                }}>
                  {customer.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage 