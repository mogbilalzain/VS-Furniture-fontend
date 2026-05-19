'use client';

import { AuthProvider } from '../lib/auth-context';
import { FavoritesProvider } from '../lib/contexts/favorites-context';
import ErrorBoundary from './ErrorBoundary';
import MaintenanceGate from './MaintenanceGate';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function ClientLayout({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <MaintenanceGate>{children}</MaintenanceGate>
          <FloatingWhatsApp />
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}