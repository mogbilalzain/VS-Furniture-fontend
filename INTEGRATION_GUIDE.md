# VS Furniture - Frontend Backend Integration Guide

## 🚀 تم ربط Laravel Backend بـ Next.js Frontend بنجاح!

### 📋 ما تم إنجازه:

#### 1. **API Client** (lib/api.js)
- ✅ HTTP client مع support للـ authentication
- ✅ Automatic token management
- ✅ Error handling
- ✅ All API endpoints (Auth, Products, Categories, Orders, Contact, Dashboard)

#### 2. **Authentication Context** (lib/auth-context.js)
- ✅ Global authentication state
- ✅ Login/logout functionality
- ✅ Admin role checking
- ✅ Token persistence

#### 3. **Custom Hooks** (lib/hooks/)
- ✅ useApi - Generic API hook
- ✅ usePaginatedApi - For paginated data
- ✅ useProducts - Product-specific hooks
- ✅ useCategories - Category-specific hooks
- ✅ useOrders - Order-specific hooks
- ✅ useDashboard - Dashboard statistics

#### 4. **Updated Admin Pages**
- ✅ Login page with real API integration
- ✅ Dashboard with live statistics
- ✅ Error handling and loading states

#### 5. **CORS Configuration**
- ✅ Laravel CORS setup for Next.js
- ✅ Proper headers and origins

### 🌐 API Endpoints Available:

#### **Authentication:**
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - التسجيل
- `GET /api/auth/profile` - الملف الشخصي

#### **Products:**
- `GET /api/products` - عرض المنتجات (عام)
- `GET /api/products/{id}` - عرض منتج واحد
- `POST /api/products` - إنشاء منتج (admin)
- `PUT /api/products/{id}` - تحديث منتج (admin)
- `DELETE /api/products/{id}` - حذف منتج (admin)

#### **Categories:**
- `GET /api/categories` - عرض الفئات
- `POST /api/categories` - إنشاء فئة (admin)
- `PUT /api/categories/{id}` - تحديث فئة (admin)

#### **Orders:**
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders` - عرض الطلبات (admin)

#### **Dashboard:**
- `GET /api/dashboard/stats` - إحصائيات الإدارة

### 🔧 كيفية الاستخدام:

#### 1. **Authentication:**
```javascript
import { useAuth } from '../lib/auth-context';

const { login, logout, user, isAdmin, loading, error } = useAuth();

// Login
const result = await login({ username: 'admin', password: 'admin123' });

// Check if user is admin
if (isAdmin()) {
  // User is admin
}
```

#### 2. **Products:**
```javascript
import { useProducts, useProductOperations } from '../lib/hooks/useProducts';

// Get paginated products
const { data, loading, error, updateParams } = useProducts();

// Product operations
const { create, update, delete } = useProductOperations();
```

#### 3. **Categories:**
```javascript
import { useCategories } from '../lib/hooks/useCategories';

const { data: categories, loading, error } = useCategories();
```

#### 4. **Dashboard:**
```javascript
import { useDashboardStats } from '../lib/hooks/useDashboard';

const { data: stats, loading, error } = useDashboardStats();
```

### 🧪 اختبار التكامل:

#### في Browser Console:
```javascript
import { testAPIIntegration } from './lib/test-api';

// Test all endpoints
testAPIIntegration();

// Test specific endpoint
import { testEndpoints } from './lib/test-api';
testEndpoints.login();
```

### 🔐 بيانات الاختبار:

#### **Admin User:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@vsfurniture.com`

#### **Regular User:**
- Username: `user`
- Password: `user123`
- Email: `user@vsfurniture.com`

### 🌐 URLs:

#### **Frontend (Next.js):**
- Development: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

#### **Backend (Laravel):**
- API Base: `http://localhost:8000/api`
- Swagger Docs: `http://localhost:8000/api-docs`

### 🚀 تشغيل المشروع:

#### 1. **Backend (Laravel):**
```bash
cd vs-laravel-backend
php artisan serve --host=127.0.0.1 --port=8000
```

#### 2. **Frontend (Next.js):**
```bash
cd vs-nextjs
npm run dev
```

### 📱 الخطوات التالية:

1. ✅ ربط صفحات Products لاستخدام API
2. ✅ ربط صفحات Orders لاستخدام API
3. ✅ ربط صفحة Contact لاستخدام API
4. ✅ إضافة Product Management في Admin
5. ✅ إضافة Order Management في Admin

### 🛠️ مشاكل شائعة:

#### **CORS Error:**
- تأكد من تشغيل Laravel على `localhost:8000`
- تأكد من تشغيل Next.js على `localhost:3000`

#### **Authentication Error:**
- تأكد من صحة بيانات الدخول
- تحقق من وجود token في localStorage

#### **API Connection Error:**
- تأكد من تشغيل Laravel server
- تحقق من URL في `lib/config.js`

### 🎯 نجح التكامل! 🎉

الآن يمكنك استخدام جميع APIs من Laravel في Next.js بسهولة!