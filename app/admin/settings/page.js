'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../../lib/localStorage-utils'

const SettingsPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      siteName: 'V/S Furniture',
      siteDescription: 'Premium office furniture solutions',
      contactEmail: 'info@vsfurniture.com',
      contactPhone: '+971 4 123 4567'
    },
    company: {
      companyName: 'V/S Furniture LLC',
      address: 'Dubai, UAE',
      website: 'www.vsfurniture.com',
      taxId: '123456789'
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
      emailNotifications: true
    }
  })

  useEffect(() => {
    // Check for authentication using new system
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Settings page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Settings page - User is authenticated admin');
    }
  }, [router])

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const saveSettings = () => {
    alert('Settings saved successfully!')
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      alert('Settings reset to default values')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'company', label: 'Company Info', icon: 'fas fa-building' },
    { id: 'system', label: 'System', icon: 'fas fa-server' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>General Settings</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Site Description
                </label>
                <input
                  type="text"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.general.contactPhone}
                  onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
            </div>
          </div>
        )
      case 'company':
        return (
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>Company Information</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.company.companyName}
                  onChange={(e) => handleInputChange('company', 'companyName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Address
                </label>
                <input
                  type="text"
                  value={settings.company.address}
                  onChange={(e) => handleInputChange('company', 'address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Website
                </label>
                <input
                  type="url"
                  value={settings.company.website}
                  onChange={(e) => handleInputChange('company', 'website', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Tax ID
                </label>
                <input
                  type="text"
                  value={settings.company.taxId}
                  onChange={(e) => handleInputChange('company', 'taxId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none'
                    e.target.style.borderColor = '#FFD700'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>
            </div>
          </div>
        )
      case 'system':
        return (
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>System Settings</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Maintenance Mode
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Temporarily disable the website
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.system.maintenanceMode ? '#FFD700' : '#ccc',
                    transition: '0.3s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      transform: settings.system.maintenanceMode ? 'translateX(26px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Debug Mode
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Enable detailed error reporting
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.system.debugMode}
                    onChange={(e) => handleInputChange('system', 'debugMode', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.system.debugMode ? '#FFD700' : '#ccc',
                    transition: '0.3s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      transform: settings.system.debugMode ? 'translateX(26px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Auto Backup
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Automatically backup data daily
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.system.autoBackup}
                    onChange={(e) => handleInputChange('system', 'autoBackup', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.system.autoBackup ? '#FFD700' : '#ccc',
                    transition: '0.3s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      transform: settings.system.autoBackup ? 'translateX(26px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>Settings</h3>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>
              Configure your {activeTab} settings here.
            </p>
          </div>
        )
    }
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
          }}>Settings</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>Manage your application settings</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button 
            onClick={resetSettings}
            style={{
              background: '#6b7280',
              color: 'white',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4b5563'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#6b7280'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Reset
          </button>
          <button 
            onClick={saveSettings}
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
            <i className="fas fa-save"></i>
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab.id ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #FFD700' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#111827' : '#6b7280',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          padding: '2rem'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage 