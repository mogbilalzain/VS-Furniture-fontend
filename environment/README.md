# 🌍 Environment Configuration System

نظام إدارة البيئات المركزي للمشروع - يمكنك من تغيير جميع إعدادات البيئة من مكان واحد.

## 📁 ملفات النظام

- `config.js` - الملف الرئيسي لإعدادات البيئات
- `index.js` - دوال مساعدة لسهولة الاستخدام
- `README.md` - هذا الملف (دليل الاستخدام)

## 🚀 كيفية تغيير البيئة

### الطريقة السريعة:
افتح ملف `config.js` وغير هذا السطر:
```javascript
const CURRENT_ENVIRONMENT = 'development'; // غير إلى 'production' أو 'staging'
```

### البيئات المتاحة:
- `development` - بيئة التطوير (localhost)
- `production` - بيئة الإنتاج (الموقع الحقيقي)
- `staging` - بيئة التجريب (للاختبار قبل النشر)

## 🔧 الإعدادات المتاحة

### إعدادات التطوير (Development):
```javascript
development: {
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  FRONTEND_BASE_URL: 'http://localhost:3000',
  IMAGE_BASE_URL: 'http://localhost:3000',
  DEBUG_MODE: true,
  LOG_LEVEL: 'debug',
  CACHE_ENABLED: false,
}
```

### إعدادات الإنتاج (Production):
```javascript
production: {
  API_BASE_URL: 'https://your-domain.com/api',
  FRONTEND_BASE_URL: 'https://your-domain.com',
  IMAGE_BASE_URL: 'https://your-domain.com',
  DEBUG_MODE: false,
  LOG_LEVEL: 'error',
  CACHE_ENABLED: true,
}
```

## 💻 كيفية الاستخدام في الكود

### الاستيراد:
```javascript
import { ENV_CONFIG, buildApiUrl, buildImageUrl } from '../environment';
```

### الاستخدام:
```javascript
// الحصول على رابط API
const apiUrl = ENV_CONFIG.API_BASE_URL;

// بناء رابط API كامل
const productsUrl = buildApiUrl('/products');

// بناء رابط صورة
const imageUrl = buildImageUrl('/images/products/desk.jpg');

// فحص البيئة
if (ENV_CONFIG.isProduction()) {
  // كود خاص بالإنتاج
}
```

## 🔄 للتبديل بين البيئات:

### 1. للتطوير المحلي:
```javascript
const CURRENT_ENVIRONMENT = 'development';
```

### 2. للنشر على الإنتاج:
```javascript
const CURRENT_ENVIRONMENT = 'production';
```
ثم حدث الروابط في قسم `production`:
```javascript
production: {
  API_BASE_URL: 'https://yourdomain.com/api',
  FRONTEND_BASE_URL: 'https://yourdomain.com',
  IMAGE_BASE_URL: 'https://yourdomain.com',
  // ...
}
```

## 🛠️ إضافة بيئة جديدة:

يمكنك إضافة بيئة جديدة (مثل testing) بهذه الطريقة:

```javascript
const environments = {
  // البيئات الموجودة...
  
  testing: {
    API_BASE_URL: 'http://test.localhost:8000/api',
    FRONTEND_BASE_URL: 'http://test.localhost:3000',
    IMAGE_BASE_URL: 'http://test.localhost:3000',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
    CACHE_ENABLED: false,
  }
};
```

## ⚙️ إعدادات Laravel Backend:

لتحديث Laravel backend ليتماشى مع النظام الجديد، أضف هذا في ملف `.env`:

```env
# Frontend URL for image generation
FRONTEND_URL=http://localhost:3000
```

للإنتاج:
```env
FRONTEND_URL=https://yourdomain.com
```

## 🎯 الفوائد:

1. **إدارة مركزية** - تغيير جميع الروابط من مكان واحد
2. **سهولة النشر** - تبديل سريع بين البيئات
3. **منع الأخطاء** - روابط ثابتة ومنظمة
4. **مرونة عالية** - إضافة بيئات جديدة بسهولة
5. **تسجيل تلقائي** - معلومات البيئة تظهر في console

## 🚨 ملاحظات مهمة:

- **لا تنس تحديث الروابط** في قسم production قبل النشر
- **تأكد من البيئة** قبل النشر (`CURRENT_ENVIRONMENT`)
- **اختبر البيئة** بعد التغيير للتأكد من عمل كل شيء
- **احتفظ بنسخة احتياطية** من الإعدادات الحالية

---

**💡 نصيحة:** استخدم `ENV_CONFIG.logEnvironmentInfo()` لطباعة معلومات البيئة الحالية في console للتأكد من الإعدادات.
