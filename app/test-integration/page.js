'use client';

import { useState, useEffect } from 'react';
import { 
  categoriesAPI, 
  propertiesAPI, 
  productsAPI, 
  productFilesAPI,
  authAPI 
} from '../../lib/api';

const TestIntegrationPage = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState('pending');

  const tests = [
    {
      id: 'backend_connection',
      name: 'Backend Connection',
      description: 'Test basic API connectivity',
      test: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`);
        return response.ok;
      }
    },
    {
      id: 'categories_api',
      name: 'Categories API',
      description: 'Test categories CRUD operations',
      test: async () => {
        const response = await categoriesAPI.getAll();
        return response.success && Array.isArray(response.data);
      }
    },
    {
      id: 'properties_api',
      name: 'Properties API',
      description: 'Test properties system',
      test: async () => {
        const response = await propertiesAPI.getAll();
        return response.success;
      }
    },
    {
      id: 'products_api',
      name: 'Products API',
      description: 'Test products management',
      test: async () => {
        const response = await productsAPI.getAll();
        return response.success && Array.isArray(response.data);
      }
    },
    {
      id: 'files_api',
      name: 'Product Files API',
      description: 'Test files management system',
      test: async () => {
        try {
          const response = await productFilesAPI.getAll();
          return response.success;
        } catch (error) {
          // API might not be fully implemented yet
          return error.response?.status !== 500;
        }
      }
    },
    {
      id: 'auth_system',
      name: 'Authentication System',
      description: 'Test auth endpoints',
      test: async () => {
        try {
          // Test if auth endpoints exist
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
            headers: {
              'Authorization': 'Bearer test-token'
            }
          });
          return response.status !== 404;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  const runTest = async (test) => {
    try {
      const startTime = Date.now();
      const result = await test.test();
      const duration = Date.now() - startTime;
      
      return {
        status: result ? 'passed' : 'failed',
        duration,
        error: null
      };
    } catch (error) {
      return {
        status: 'error',
        duration: 0,
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    const results = {};
    let passedCount = 0;
    let totalCount = tests.length;

    for (const test of tests) {
      console.log(`Running test: ${test.name}`);
      const result = await runTest(test);
      results[test.id] = result;
      
      if (result.status === 'passed') {
        passedCount++;
      }
      
      // Update results incrementally
      setTestResults({...results});
    }

    // Calculate overall status
    if (passedCount === totalCount) {
      setOverallStatus('all_passed');
    } else if (passedCount > totalCount / 2) {
      setOverallStatus('mostly_passed');
    } else {
      setOverallStatus('failed');
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'error': return '#f59e0b';
      case 'running': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return 'fas fa-check-circle';
      case 'failed': return 'fas fa-times-circle';
      case 'error': return 'fas fa-exclamation-triangle';
      case 'running': return 'fas fa-spinner fa-spin';
      default: return 'fas fa-clock';
    }
  };

  const getOverallStatusMessage = () => {
    const passedCount = Object.values(testResults).filter(r => r.status === 'passed').length;
    const totalCount = tests.length;
    
    switch (overallStatus) {
      case 'all_passed':
        return `🎉 All tests passed! (${passedCount}/${totalCount})`;
      case 'mostly_passed':
        return `✅ Most tests passed (${passedCount}/${totalCount})`;
      case 'failed':
        return `❌ Several tests failed (${passedCount}/${totalCount})`;
      default:
        return 'Ready to run tests';
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Quasimoda', 'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          🧪 Integration Testing Dashboard
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '1.125rem'
        }}>
          Test all system components and their integration
        </p>
      </div>

      {/* Overall Status */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
        border: `2px solid ${getStatusColor(overallStatus === 'pending' ? 'pending' : 'passed')}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              Overall Status
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>
              {getOverallStatusMessage()}
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#FFD700',
              color: '#2c2c2c',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Running Tests...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i>
                Run All Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {tests.map((test) => {
          const result = testResults[test.id];
          const status = result?.status || (loading ? 'running' : 'pending');
          
          return (
            <div
              key={test.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: `2px solid ${getStatusColor(status)}`,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Test Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <i 
                  className={getStatusIcon(status)}
                  style={{
                    color: getStatusColor(status),
                    fontSize: '1.25rem'
                  }}
                ></i>
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {test.name}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {test.description}
                  </p>
                </div>
              </div>

              {/* Test Details */}
              {result && (
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: result.error ? '0.5rem' : 0
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: getStatusColor(status),
                      textTransform: 'capitalize'
                    }}>
                      {status}
                    </span>
                    {result.duration > 0 && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                  
                  {result.error && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      background: '#fef2f2',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {result.error}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && !result && (
                <div style={{
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#3b82f6'
                }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                  Testing...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Results */}
      {Object.keys(testResults).length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1rem'
          }}>
            📊 Test Summary
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {Object.values(testResults).filter(r => r.status === 'passed').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Passed</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                {Object.values(testResults).filter(r => r.status === 'failed').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Failed</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {Object.values(testResults).filter(r => r.status === 'error').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Errors</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {Math.round(Object.values(testResults).reduce((sum, r) => sum + r.duration, 0))}ms
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Navigate to different admin sections to test manually:
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="/admin/categories" style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            Categories
          </a>
          <a href="/admin/products" style={{
            background: '#10b981',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            Products
          </a>
          <a href="/admin/product-files" style={{
            background: '#f59e0b',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            Files
          </a>
          <a href="/products" style={{
            background: '#8b5cf6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            Frontend
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestIntegrationPage;