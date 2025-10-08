'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { authStorage, adminRedirect } from '../../../lib/localStorage-utils';

const AdminLogin = () => {
  const router = useRouter();
  const { login, user, isAuthenticated, isAdmin, loading, error, initialized } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Clear login error when form data changes
  useEffect(() => {
    if (loginError) {
      setLoginError('');
    }
  }, [formData.email, formData.password]);

  // Check authentication once when component mounts
  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      // Debug: Log current auth state
      console.log('🔍 Login page - Auth state check');
      console.log('🔍 React state user:', user);
      console.log('🔍 localStorage debug:', authStorage.getDebugInfo());
      
      // Check if user is already authenticated admin (from localStorage or React state)
      if (authStorage.isAuthenticatedAdmin() || (user && user.role === 'admin')) {
        console.log('✅ User already authenticated as admin, redirecting...');
        window.location.href = '/admin/categories';
        return;
      }
    }
  }, [initialized, user, hasCheckedAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loginLoading) {
      return;
    }

    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setLoginError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLoginError('Please enter a valid email address');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('🔐 Attempting admin login with email:', formData.email);
      
      const result = await login({
        username: formData.email, // Send email as username to backend
        password: formData.password
      });
      
      console.log('📥 Login result:', result);
      
      if (result && result.success) {
        console.log('✅ Login successful, redirecting...');
        
        // Verify token is saved before redirect
        const savedToken = localStorage.getItem('auth_token');
        console.log('🔍 Token before redirect:', savedToken ? savedToken.substring(0, 30) + '...' : 'null');
        console.log('🔍 Redirect timestamp:', new Date().toISOString());
        
        // Add small delay to ensure token is fully saved, then use router navigation
        setTimeout(() => {
          const finalToken = localStorage.getItem('auth_token');
          console.log('🔍 Final token check before redirect:', finalToken ? finalToken.substring(0, 30) + '...' : 'null');
          window.location.href = '/admin/categories';
        }, 200);
        return;
      } else {
        const errorMessage = result?.error || 'Invalid email or password';
        console.error('❌ Login failed:', errorMessage);
        setLoginError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setLoginError(
        err?.response?.data?.message || 
        err.message || 
        'Login failed. Please check your connection and try again.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Show loading while auth context is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (initialized && (authStorage.isAuthenticatedAdmin() || (user && user.role === 'admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your email to access the admin dashboard
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Error Message */}
            {(loginError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="text-red-800 text-sm font-medium">
                    {loginError || error}
                  </div>
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loginLoading}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 sm:text-sm"
                  placeholder="admin@vsfurniture.com"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  disabled={loginLoading}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loginLoading || !formData.email.trim() || !formData.password.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in to Admin Panel
                  </>
                )}
              </button>
            </div>

            {/* Demo credentials and back link */}
            <div className="text-center space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-600">
                  Email: <span className="font-mono">admin@vsfurniture.com</span>
                </p>
                <p className="text-xs text-blue-600">
                  Password: <span className="font-mono">password</span>
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={loginLoading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;