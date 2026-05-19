'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { settingsAPI } from '../lib/api';
import MaintenancePage from './MaintenancePage';

/**
 * Wraps the public site and shows a maintenance page when the admin has
 * toggled `maintenance_mode` on. Admin routes (/admin/**) always pass
 * through so the admin can disable maintenance mode again.
 */
export default function MaintenanceGate({ children }) {
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/admin');

  // Default to false to avoid flashing the maintenance page while we fetch.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isAdminRoute) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const response = await settingsAPI.getMaintenance();
        const next = !!response?.data?.enabled;
        if (!cancelled) setEnabled(next);
      } catch (error) {
        // Network/API error: keep current state. Better to leave the site
        // accessible than to lock everyone out because of a transient failure.
        console.warn('MaintenanceGate: failed to fetch maintenance status', error);
      }
    };

    fetchStatus();

    // Re-check periodically and when the tab regains focus, so toggling
    // maintenance from another tab/admin session is reflected within ~60s.
    const intervalId = setInterval(fetchStatus, 60000);
    const onFocus = () => fetchStatus();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [isAdminRoute, pathname]);

  if (isAdminRoute) {
    return children;
  }

  if (enabled) {
    return <MaintenancePage />;
  }

  return children;
}
