'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { authStorage } from '../../lib/localStorage-utils'
import NotificationsBell from '../../components/NotificationsBell'
import './admin.css'

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (except for login page)
    if (pathname !== '/admin/login') {
      console.log('🔍 Admin Layout - Checking authentication for:', pathname);
      
      if (!authStorage.isAuthenticatedAdmin()) {
        console.log('❌ Admin Layout - Not authenticated admin, redirecting to login...');
        console.log('🔍 Debug info:', authStorage.getDebugInfo());
        router.replace('/admin/login');
        return;
      }
      
      console.log('✅ Admin Layout - User is authenticated admin');
    }
    setIsLoading(false)
  }, [router, pathname])

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden)
  }

  const logout = () => {
    console.log('🚪 Admin Layout - Logging out...');
    authStorage.clearAuth();
    router.replace('/admin/login');
  }

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: "'Quasimoda', 'Inter', sans-serif"
      }}>
        <div style={{
          fontSize: '1.125rem',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  // If it's the login page, don't show the layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="admin-panel" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif", backgroundColor: '#f5f5f5' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        style={{
          display: 'none',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          background: '#FFD700',
          color: '#2c2c2c',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem',
          cursor: 'pointer'
        }}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3d5c4d 0%, #2c2c2c 100%)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          width: '250px',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: sidebarHidden ? 'translateX(-100%)' : 'translateX(0)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header - Fixed */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #4a5568',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>
            V/S
          </div>
          <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Admin Dashboard</div>
        </div>
        
        {/* Sidebar Navigation - Scrollable */}
        <nav 
          className="admin-sidebar-nav"
          style={{ 
            marginTop: '1.5rem',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: '2rem'
          }}>
          <Link href="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/dashboard' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/dashboard' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/dashboard') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/dashboard') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-home" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Dashboard
          </Link>
          
          <Link href="/admin/products" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/products' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/products' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/products') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/products') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-box" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Products
          </Link>
          
          <Link href="/admin/contact-messages" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname.startsWith('/admin/contact-messages') ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname.startsWith('/admin/contact-messages') ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!pathname.startsWith('/admin/contact-messages')) {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (!pathname.startsWith('/admin/contact-messages')) {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-envelope" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Contact Messages
          </Link>
          
          <Link href="/admin/certifications" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/certifications' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/certifications' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/certifications') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/certifications') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-certificate" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Certifications
          </Link>
          
          <Link href="/admin/solutions" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/solutions' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/solutions' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/solutions') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/solutions') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-lightbulb" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Solutions
          </Link>
          
          {/* <Link href="/admin/orders" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/orders' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/orders' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/orders') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/orders') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-shopping-cart" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Orders
          </Link> */}
          
          <Link href="/admin/categories" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/categories' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/categories' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/categories') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/categories') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-tags" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Categories
          </Link>
          
          <Link href="/admin/homepage-content" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/homepage-content' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/homepage-content' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/homepage-content') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/homepage-content') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-home" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Content Management
          </Link>
          
          <Link href="/admin/properties" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/properties' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/properties' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/properties') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/properties') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-cogs" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Properties
          </Link>
          
          <Link href="/admin/property-values" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/property-values' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/property-values' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/property-values') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/property-values') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-list" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Property Values
          </Link>
          
          <Link href="/admin/product-files" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/product-files' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/product-files' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/product-files') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/product-files') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-file-pdf" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Product Files
          </Link>
          
          
          <Link href="/admin/materials/categories" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname.startsWith('/admin/materials') ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname.startsWith('/admin/materials') ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!pathname.startsWith('/admin/materials')) {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (!pathname.startsWith('/admin/materials')) {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-palette" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Materials
          </Link>
          
          <Link href="/admin/reports" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/reports' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/reports' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/reports') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/reports') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-chart-bar" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Reports
          </Link>
          
          <Link href="/admin/settings" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: pathname === '/admin/settings' ? '#FFD700' : '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            margin: '0.25rem 0.5rem',
            backgroundColor: pathname === '/admin/settings' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/admin/settings') {
              e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
              e.target.style.color = '#FFD700'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/admin/settings') {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#cbd5e1'
            }
          }}>
            <i className="fas fa-cog" style={{ width: '20px', marginRight: '0.75rem' }}></i>
            Settings
          </Link>
         
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarHidden ? '0' : '250px',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh'
        }}
      >
        {/* Header */}
        <header style={{
          background: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: '#111827',
                margin: 0
              }}>Admin Dashboard</h1>
              <p style={{
                color: '#6b7280',
                margin: '0.25rem 0 0 0'
              }}>Welcome back, Admin</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* Notifications Bell */}
              <NotificationsBell />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FFD700'
                    e.target.style.borderColor = '#FFD700'
                    e.target.querySelector('svg').style.fill = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6'
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.querySelector('svg').style.fill = '#6b7280'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6b7280" viewBox="0 0 256 256" style={{ transition: 'fill 0.3s ease' }}>
                    <path d="M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z"></path>
                  </svg>
                </div>
                <span style={{
                  color: '#374151',
                  fontWeight: 500
                }}>Admin</span>
              </div>
              <button 
                onClick={logout}
                style={{
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          padding: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
} 