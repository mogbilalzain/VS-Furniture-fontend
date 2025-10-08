/**
 * أمثلة على كيفية استخدام نظام البيئات
 * Examples of how to use the Environment System
 */

import { ENV_CONFIG, buildApiUrl, buildImageUrl, isProduction } from './index.js';

// ============================================================================
// مثال 1: استخدام في API calls
// ============================================================================

export const fetchProducts = async () => {
  // بناء رابط API تلقائياً حسب البيئة
  const url = buildApiUrl('/products');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    // تسجيل الأخطاء حسب مستوى البيئة
    if (ENV_CONFIG.DEBUG_MODE) {
      console.error('❌ Error fetching products:', error);
      console.log('🔗 API URL used:', url);
    }
    throw error;
  }
};

// ============================================================================
// مثال 2: استخدام في مكون React للصور
// ============================================================================

export const ProductImage = ({ imagePath, alt, className }) => {
  // بناء رابط الصورة تلقائياً
  const imageUrl = buildImageUrl(imagePath);
  
  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      onError={(e) => {
        // في حالة فشل تحميل الصورة
        e.target.src = buildImageUrl('/images/placeholder-product.jpg');
        
        // تسجيل الخطأ في بيئة التطوير فقط
        if (ENV_CONFIG.DEBUG_MODE) {
          console.warn('⚠️ Image failed to load:', imageUrl);
        }
      }}
    />
  );
};

// ============================================================================
// مثال 3: تخصيص السلوك حسب البيئة
// ============================================================================

export const initializeApp = () => {
  // طباعة معلومات البيئة
  ENV_CONFIG.logEnvironmentInfo();
  
  if (isProduction()) {
    // إعدادات خاصة بالإنتاج
    console.log('🚀 Running in Production Mode');
    
    // تعطيل console.log في الإنتاج
    if (!ENV_CONFIG.DEBUG_MODE) {
      console.log = () => {};
      console.warn = () => {};
    }
    
    // تفعيل Google Analytics مثلاً
    // initializeAnalytics();
    
  } else {
    // إعدادات خاصة بالتطوير
    console.log('🔧 Running in Development Mode');
    
    // تفعيل أدوات التطوير
    if (typeof window !== 'undefined') {
      window.ENV_CONFIG = ENV_CONFIG; // للوصول من console
    }
  }
};

// ============================================================================
// مثال 4: إعداد axios مع البيئات
// ============================================================================

export const createApiClient = () => {
  // يمكن استخدام axios أو أي HTTP client
  const apiClient = {
    baseURL: ENV_CONFIG.API_BASE_URL,
    timeout: isProduction() ? 10000 : 30000, // timeout أقل في الإنتاج
    
    get: async (endpoint) => {
      const url = buildApiUrl(endpoint);
      return fetch(url);
    },
    
    post: async (endpoint, data) => {
      const url = buildApiUrl(endpoint);
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }
  };
  
  return apiClient;
};

// ============================================================================
// مثال 5: التحقق من البيئة في مكونات React
// ============================================================================

export const DebugPanel = () => {
  // عرض panel التطوير فقط في بيئة التطوير
  if (!ENV_CONFIG.DEBUG_MODE) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#333',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>🌍 Environment: {ENV_CONFIG.ENVIRONMENT}</div>
      <div>🔗 API: {ENV_CONFIG.API_BASE_URL}</div>
      <div>🖼️ Images: {ENV_CONFIG.IMAGE_BASE_URL}</div>
    </div>
  );
};

// ============================================================================
// مثال 6: دالة مساعدة للتحقق من صحة الروابط
// ============================================================================

export const validateEnvironmentUrls = async () => {
  const results = {
    api: false,
    frontend: false,
    images: false
  };
  
  try {
    // فحص API
    const apiResponse = await fetch(buildApiUrl('/health-check'), { 
      method: 'HEAD',
      timeout: 5000 
    });
    results.api = apiResponse.ok;
  } catch (error) {
    console.warn('⚠️ API health check failed:', error.message);
  }
  
  try {
    // فحص الصور
    const imageResponse = await fetch(buildImageUrl('/images/placeholder-product.jpg'), { 
      method: 'HEAD',
      timeout: 5000 
    });
    results.images = imageResponse.ok;
  } catch (error) {
    console.warn('⚠️ Images health check failed:', error.message);
  }
  
  results.frontend = true; // إذا وصلنا هنا فالفرونت إند يعمل
  
  if (ENV_CONFIG.DEBUG_MODE) {
    console.log('🏥 Environment Health Check:', results);
  }
  
  return results;
};

// ============================================================================
// مثال 7: إعداد مختلف للكاش حسب البيئة
// ============================================================================

export const getCacheConfig = () => {
  if (isProduction()) {
    return {
      enabled: true,
      duration: 3600000, // ساعة واحدة
      maxSize: 100
    };
  } else {
    return {
      enabled: false, // بدون كاش في التطوير
      duration: 0,
      maxSize: 0
    };
  }
};

// تصدير جميع الأمثلة
export default {
  fetchProducts,
  ProductImage,
  initializeApp,
  createApiClient,
  DebugPanel,
  validateEnvironmentUrls,
  getCacheConfig
};
