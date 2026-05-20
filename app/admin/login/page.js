'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { authStorage, adminRedirect } from '../../../lib/localStorage-utils';

const AdminLogin = () => {
  const router = useRouter();
  const { login, user, isAuthenticated, isAdmin, loading, error, initialized } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (loginError) {
      setLoginError('');
    }
  }, [formData.email, formData.password]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);

      console.log('🔍 Login page - Auth state check');
      console.log('🔍 React state user:', user);
      console.log('🔍 localStorage debug:', authStorage.getDebugInfo());

      if (authStorage.isAuthenticatedAdmin() || (user && user.role === 'admin')) {
        console.log('✅ User already authenticated as admin, redirecting...');
        window.location.href = '/admin/categories';
        return;
      }
    }
  }, [initialized, user, hasCheckedAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginLoading) {
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setLoginError('Please enter both email and password');
      return;
    }

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
        username: formData.email,
        password: formData.password,
      });

      console.log('📥 Login result:', result);

      if (result && result.success) {
        console.log('✅ Login successful, redirecting...');

        const savedToken = localStorage.getItem('auth_token');
        console.log(
          '🔍 Token before redirect:',
          savedToken ? savedToken.substring(0, 30) + '...' : 'null'
        );
        console.log('🔍 Redirect timestamp:', new Date().toISOString());

        setTimeout(() => {
          const finalToken = localStorage.getItem('auth_token');
          console.log(
            '🔍 Final token check before redirect:',
            finalToken ? finalToken.substring(0, 30) + '...' : 'null'
          );
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

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
        <p className="text-on-surface-variant text-[14px] font-medium">Initializing…</p>
      </div>
    );
  }

  if (initialized && (authStorage.isAuthenticatedAdmin() || (user && user.role === 'admin'))) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
        <p className="text-on-surface-variant text-[14px] font-medium">
          Redirecting to admin panel…
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12">
      {/* Atmospheric orbs */}
      <div
        aria-hidden
        className="absolute top-[-10%] right-[-10%] w-[480px] h-[480px] rounded-full bg-primary-container/20 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full bg-on-surface/[0.04] blur-[140px] pointer-events-none"
      />

      <section className="relative z-10 w-full max-w-[460px]">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-on-surface flex items-center justify-center mb-4 admin-shadow-soft">
            <Image
              src="/vs-logo.svg"
              alt="VS Furniture"
              width={36}
              height={36}
              className="brightness-0 invert"
              priority
            />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-on-surface">VS Furniture</h1>
          <p className="text-on-surface-variant text-[13px] mt-1 tracking-wide uppercase">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-[20px] border border-surface-container admin-shadow-soft p-8 sm:p-10">
          <header className="mb-8">
            <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-on-surface leading-tight">
              Welcome back
            </h2>
            <p className="text-on-surface-variant mt-2 text-[15px] leading-relaxed">
              Please enter your credentials to access your workspace.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {(loginError || error) && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
                <span className="material-symbols-outlined mt-0.5 text-[20px]">error</span>
                <p className="text-[13px] font-medium leading-relaxed">{loginError || error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[14px] font-medium text-on-surface-variant tracking-[0.01em] block"
              >
                Work Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-on-surface transition-colors text-[22px] pointer-events-none">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loginLoading}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-surface-container rounded-[20px] outline-none focus:border-on-surface focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[14px] font-medium text-on-surface-variant tracking-[0.01em] block"
              >
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-on-surface transition-colors text-[22px] pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={loginLoading}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-surface-container rounded-[20px] outline-none focus:border-on-surface focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginLoading || !formData.email.trim() || !formData.password.trim()}
              className="w-full bg-primary-container text-on-primary-fixed font-bold py-4 rounded-[20px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none mt-2"
            >
              {loginLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[22px]">
                    progress_activity
                  </span>
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Back link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={loginLoading}
                className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface transition-colors font-medium disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Home
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container" />
            </div>
          </div>

          {/* Footer links */}
          <footer className="text-center text-[12px] font-semibold text-on-surface-variant/40 flex items-center justify-center gap-3 flex-wrap">
            <a href="#" className="hover:text-on-surface transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-on-surface transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-on-surface transition-colors">
              System Status
            </a>
          </footer>
        </div>

        {/* Copyright */}
        <p className="text-center text-[12px] text-on-surface-variant/50 mt-6">
          © {new Date().getFullYear()} VS Furniture. Enterprise Admin Panel.
        </p>
      </section>
    </main>
  );
};

export default AdminLogin;
