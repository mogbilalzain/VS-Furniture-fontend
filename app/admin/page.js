'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../lib/localStorage-utils'

const AdminIndexPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated, redirect accordingly
    if (authStorage.isAuthenticatedAdmin()) {
      console.log('✅ Admin index - User authenticated, redirecting to categories...');
      router.replace('/admin/categories');
    } else {
      console.log('❌ Admin index - Not authenticated, redirecting to login...');
      router.replace('/admin/login');
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
        <p>سيتم نقلك إلى صفحة تسجيل الدخول</p>
      </div>
    </div>
  )
}

export default AdminIndexPage 