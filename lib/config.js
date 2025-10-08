/**
 * Application Configuration
 * Updated to use centralized environment system
 */

import { ENV_CONFIG } from '../environment';

export const config = {
  api: {
    baseURL: ENV_CONFIG.API_BASE_URL,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'VS Furniture',
    url: ENV_CONFIG.FRONTEND_BASE_URL,
  },
};

// Debug environment variables
if (typeof window !== 'undefined' && ENV_CONFIG.DEBUG_MODE) {
  console.log('🔧 Environment Configuration:');
  console.log('Current Environment:', ENV_CONFIG.ENVIRONMENT);
  console.log('API Base URL:', ENV_CONFIG.API_BASE_URL);
  console.log('Frontend Base URL:', ENV_CONFIG.FRONTEND_BASE_URL);
  console.log('Config API baseURL:', config.api.baseURL);
}

export default config;