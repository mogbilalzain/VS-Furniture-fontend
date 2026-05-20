'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { authStorage } from '../../lib/localStorage-utils'
import NotificationsBell from '../../components/NotificationsBell'
import './admin.css'

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/admin/products', label: 'Products', icon: 'inventory_2' },
      { href: '/admin/categories', label: 'Categories', icon: 'category' },
      { href: '/admin/import-products', label: 'Import Products', icon: 'file_upload' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/contact-messages', label: 'Contact Messages', icon: 'mail', matchPrefix: true },
      { href: '/admin/certifications', label: 'Certifications', icon: 'workspace_premium' },
      { href: '/admin/solutions', label: 'Solutions', icon: 'lightbulb' },
      { href: '/admin/homepage-content', label: 'Content', icon: 'web' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { href: '/admin/properties', label: 'Properties', icon: 'tune' },
      { href: '/admin/property-values', label: 'Property Values', icon: 'list_alt' },
      { href: '/admin/product-files', label: 'Product Files', icon: 'description' },
      { href: '/admin/materials/categories', label: 'Materials', icon: 'palette', matchPrefix: '/admin/materials' },
      { href: '/admin/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

function isItemActive(item, pathname) {
  if (item.matchPrefix === true) return pathname.startsWith(item.href)
  if (typeof item.matchPrefix === 'string') return pathname.startsWith(item.matchPrefix)
  return pathname === item.href
}

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (pathname !== '/admin/login') {
      if (!authStorage.isAuthenticatedAdmin()) {
        router.replace('/admin/login')
        return
      }
    }
    setIsLoading(false)
  }, [router, pathname])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const logout = () => {
    authStorage.clearAuth()
    router.replace('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="admin-shell flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
          <p className="text-on-surface-variant text-body-md">Loading admin panel…</p>
        </div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="admin-shell min-h-screen bg-background text-on-background antialiased">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
        className="lg:hidden fixed top-4 left-4 z-[60] w-11 h-11 rounded-xl bg-[#0F0F10] text-primary-container flex items-center justify-center admin-shadow-md"
      >
        <span className="material-symbols-outlined text-[22px]">
          {sidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-[#0F0F10] flex flex-col py-7 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Link href="/admin/dashboard" className="px-7 mb-8 group block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center">
              <span className="text-[#0F0F10] font-black text-lg tracking-tight">
                <Image src="/vs-logo.svg" alt="VS Furniture" width={50} height={50} />
              </span>
            </div>
            <div>
              {/* <p className="text-white font-bold text-[15px] tracking-tight leading-none">
                VS Furniture
              </p> */}
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.22em] mt-1.5">
                Enterprise Admin
              </p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto admin-scrollbar px-3 pb-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-white/25 text-[10px] font-bold uppercase tracking-[0.2em]">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isItemActive(item, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? 'text-primary-container font-semibold bg-white/[0.06]'
                          : 'text-white/55 font-medium hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 h-5 w-[3px] bg-primary-container rounded-r-full" />
                      )}
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={active ? { fontVariationSettings: "'FILL' 1" } : { opacity: 0.9 }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[14px] tracking-tight">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-5 my-3 h-px bg-white/[0.06]" />
        <div className="px-5 space-y-2">
          {/* <button
            type="button"
            className="w-full bg-white/[0.04] border border-white/10 text-white/80 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white hover:border-white/15 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            <span className="text-[14px]">Support</span>
          </button> */}
          <button
            type="button"
            onClick={logout}
            className="w-full bg-white/[0.04] border border-white/10 text-white/80 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-error transition-colors hover:border-error/15 active:scale-[0.98] transition-all hover:text-error transition-colors hover:cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="admin-glass-header sticky top-0 w-full z-40 h-16 px-4 sm:px-6 lg:px-margin-desktop flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-3 flex-1 max-w-md ml-12 lg:ml-0">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <NotificationsBell />
            </div>
            <button
              type="button"
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Help"
            >
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </button>
            <div className="hidden sm:block h-8 w-px bg-outline-variant/30 mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-on-surface leading-none">Admin</p>
                <p className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-wider mt-0.5">
                  Administrator
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0F0F10] flex items-center justify-center border-2 border-primary-container">
                <span className="text-primary-container font-bold text-[13px]">VS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-margin-desktop py-6 lg:py-10 max-w-[1440px] w-full mx-auto">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-auto px-4 sm:px-6 lg:px-margin-desktop py-6 border-t border-outline-variant/30 text-on-surface-variant/60 text-[12px] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} VS Furniture. Enterprise Admin Panel.</p>
          <div className="flex gap-5">
            <span className="hover:text-on-surface transition-colors cursor-default">v1.0</span>
            <span className="hover:text-on-surface transition-colors cursor-default">Status: Operational</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
