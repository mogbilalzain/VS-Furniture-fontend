/**
 * Environment Configuration
 * يمكنك تغيير البيئة من هنا بسهولة
 */

// تحديد البيئة الحالية
const CURRENT_ENVIRONMENT = 'development'; // غيّر إلى 'development' للتطوير المحلي
//production
// إعدادات البيئات المختلفة
const environments = {
  development: {
    // إعدادات بيئة التطوير (Development)
    // Fallback إذا لم يُضبط NEXT_PUBLIC_API_URL — استعمل 8001 إن كان المنفذ 8000 لديك محجوزاً من مشروع PHP آخر.
    API_BASE_URL: 'http://127.0.0.1:8001/api',
    FRONTEND_BASE_URL: 'http://localhost:3000',
    IMAGE_BASE_URL: 'http://localhost:3000',
    
    // إعدادات أخرى للتطوير
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
    CACHE_ENABLED: false,
  },
  
  production: {
    // إعدادات بيئة الإنتاج (Production)
    API_BASE_URL: 'https://vsme.ae/api',
    FRONTEND_BASE_URL: 'https://vsme.ae/',
    IMAGE_BASE_URL: 'https://vsme.ae/',
    
    // إعدادات أخرى للإنتاج
    DEBUG_MODE:false,
    LOG_LEVEL: 'error',
    CACHE_ENABLED:true ,
  },
  
  staging: {
    // إعدادات بيئة التجريب (Staging)
    API_BASE_URL: 'https://staging.your-domain.com/api',
    FRONTEND_BASE_URL: 'https://staging.your-domain.com',
    IMAGE_BASE_URL: 'https://staging.your-domain.com',
    
    // إعدادات أخرى للتجريب
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
    CACHE_ENABLED: true,
  }
};

// الحصول على إعدادات البيئة الحالية
const currentConfig = environments[CURRENT_ENVIRONMENT];

if (!currentConfig) {
  throw new Error(`❌ البيئة "${CURRENT_ENVIRONMENT}" غير موجودة في الإعدادات!`);
}

function stripTrailingSlash(u) {
  return u.replace(/\/+$/, '');
}

/**
 * عنوان الـ API الفعلي: يمتثل لـ NEXT_PUBLIC_API_URL (.env لـ Next) ثم الإعداد المحلي الحالي.
 */
const resolvedApiBaseUrl = stripTrailingSlash(
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? String(process.env.NEXT_PUBLIC_API_URL).trim()
    : currentConfig.API_BASE_URL
);

// تصدير الإعدادات
export const ENV_CONFIG = {
  // البيئة الحالية
  ENVIRONMENT: CURRENT_ENVIRONMENT,
  
  // URLs الأساسية
  API_BASE_URL: resolvedApiBaseUrl,
  FRONTEND_BASE_URL: currentConfig.FRONTEND_BASE_URL,
  IMAGE_BASE_URL: currentConfig.IMAGE_BASE_URL,
  
  // إعدادات إضافية
  DEBUG_MODE: currentConfig.DEBUG_MODE,
  LOG_LEVEL: currentConfig.LOG_LEVEL,
  CACHE_ENABLED: currentConfig.CACHE_ENABLED,
  
  // دوال مساعدة
  isProduction: () => CURRENT_ENVIRONMENT === 'production',
  isDevelopment: () => CURRENT_ENVIRONMENT === 'development',
  isStaging: () => CURRENT_ENVIRONMENT === 'staging',
  
  // بناء URLs كاملة
  buildApiUrl: (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${resolvedApiBaseUrl}${cleanEndpoint}`;
  },
  
  buildImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${currentConfig.IMAGE_BASE_URL}${cleanPath}`;
  },
  
  // تسجيل معلومات البيئة
  logEnvironmentInfo: () => {
    if (currentConfig.DEBUG_MODE) {
      console.log('🌍 Environment Info:');
      console.log('📍 Current Environment:', CURRENT_ENVIRONMENT);
      console.log('🔗 API Base URL:', resolvedApiBaseUrl);
      console.log('🖼️ Image Base URL:', currentConfig.IMAGE_BASE_URL);
      console.log('🐛 Debug Mode:', currentConfig.DEBUG_MODE);
    }
  }
};

// طباعة معلومات البيئة عند التحميل (في التطوير فقط)
if (typeof window !== 'undefined' && currentConfig.DEBUG_MODE) {
  ENV_CONFIG.logEnvironmentInfo();
}

export default ENV_CONFIG;
