'use client';

import { AuthProvider } from '../lib/auth-context';
import { FavoritesProvider } from '../lib/contexts/favorites-context';
import ErrorBoundary from './ErrorBoundary';

export default function ClientLayout({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}