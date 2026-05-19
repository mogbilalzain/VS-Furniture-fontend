'use client';

/**
 * Full-screen maintenance page rendered when maintenance_mode is enabled.
 * Intentionally has no Header/Footer so it cannot link out to the public site
 * while maintenance is active.
 */
export default function MaintenancePage() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div
          aria-hidden="true"
          style={{
            width: '96px',
            height: '96px',
            margin: '0 auto 1.75rem',
            borderRadius: '50%',
            background: 'rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.01em',
          }}
        >
          Site Under Maintenance
        </h1>
        <p
          dir="rtl"
          lang="ar"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: '0 0 1.5rem 0',
            color: '#e2e8f0',
          }}
        >
          الموقع تحت الصيانة
        </p>

        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: '0 0 0.75rem 0',
            color: '#cbd5e1',
          }}
        >
          We&apos;re currently performing scheduled maintenance. Please check back
          soon — thank you for your patience.
        </p>
        <p
          dir="rtl"
          lang="ar"
          style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            margin: 0,
            color: '#cbd5e1',
          }}
        >
          نقوم حالياً بإجراء أعمال صيانة مجدولة. يُرجى العودة بعد قليل، ونشكركم على تفهمكم.
        </p>
      </div>
    </div>
  );
}
