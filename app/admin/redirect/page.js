'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../../lib/localStorage-utils'

const RedirectPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Check authentication and redirect accordingly
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Redirect page - Not authenticated, redirecting to login...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Redirect page - Authenticated, redirecting to categories...');
      const timer = setTimeout(() => {
        router.replace('/admin/categories');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3d5c4d 0%, #2c2c2c 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>جاري التوجيه...</h2>
        <p>سيتم نقلك إلى لوحة التحكم قريباً</p>
      </div>
    </div>
  )
}

export default RedirectPage 