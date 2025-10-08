/**
 * Environment Helper Functions
 * دوال مساعدة لاستخدام إعدادات البيئة بسهولة
 */

import { ENV_CONFIG } from './config.js';

// تصدير الإعدادات الأساسية
export { ENV_CONFIG } from './config.js';

// دوال مساعدة سريعة
export const API_BASE_URL = ENV_CONFIG.API_BASE_URL;
export const FRONTEND_BASE_URL = ENV_CONFIG.FRONTEND_BASE_URL;
export const IMAGE_BASE_URL = ENV_CONFIG.IMAGE_BASE_URL;

// دوال بناء URLs
export const buildApiUrl = (endpoint) => ENV_CONFIG.buildApiUrl(endpoint);
export const buildImageUrl = (imagePath) => ENV_CONFIG.buildImageUrl(imagePath);

// دوال فحص البيئة
export const isProduction = () => ENV_CONFIG.isProduction();
export const isDevelopment = () => ENV_CONFIG.isDevelopment();
export const isStaging = () => ENV_CONFIG.isStaging();

// دالة للحصول على إعدادات مخصصة
export const getEnvConfig = (key, defaultValue = null) => {
  return ENV_CONFIG[key] || defaultValue;
};

// دالة لطباعة معلومات البيئة
export const logEnvironmentInfo = () => ENV_CONFIG.logEnvironmentInfo();

// تصدير افتراضي
export default {
  ENV_CONFIG,
  API_BASE_URL,
  FRONTEND_BASE_URL,
  IMAGE_BASE_URL,
  buildApiUrl,
  buildImageUrl,
  isProduction,
  isDevelopment,
  isStaging,
  getEnvConfig,
  logEnvironmentInfo
};
