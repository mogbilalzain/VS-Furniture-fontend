# 🚨 إصلاح سريع لمشكلة الاتصال

## المشكلة:
```
TypeError: Failed to fetch
```

## السبب:
Laravel Backend لا يعمل أو لا يمكن الوصول إليه من Next.js

## ✅ الحل السريع:

### 1. تأكد من تشغيل Laravel Backend:

```bash
# انتقل إلى مجلد Laravel
cd vs-laravel-backend

# ابدأ Laravel server
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. تأكد من أن الخادم يعمل:

افتح في المتصفح: `http://localhost:8000/api/categories`

يجب أن ترى استجابة JSON مثل:
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### 3. اختبار الاتصال من Next.js:

افتح: `http://localhost:3000/debug`

### 4. إذا لم يعمل، تحقق من:

#### أ) Laravel Server يعمل:
```bash
netstat -ano | findstr :8000
```

#### ب) CORS مُفعّل:
تحقق من ملف `vs-laravel-backend/config/cors.php`

#### ج) Next.js يعمل:
```bash
cd vs-nextjs
npm run dev
```

### 5. أوامر التشغيل الكاملة:

#### Terminal 1 (Laravel):
```bash
cd vs-laravel-backend
php artisan serve --host=127.0.0.1 --port=8000
```

#### Terminal 2 (Next.js):
```bash
cd vs-nextjs
npm run dev
```

### 6. URLs للاختبار:

- **Next.js:** `http://localhost:3000`
- **Laravel API:** `http://localhost:8000/api`
- **Admin Login:** `http://localhost:3000/admin/login`
- **Debug Page:** `http://localhost:3000/debug`
- **Swagger:** `http://localhost:8000/api-docs`

### 7. بيانات تسجيل الدخول:

- **Username:** `admin`
- **Password:** `admin123`

## 🔧 إذا استمرت المشكلة:

### إعادة تشغيل كامل:

```bash
# إيقاف جميع العمليات
Ctrl+C في كلا Terminal

# Laravel
cd vs-laravel-backend
php artisan config:clear
php artisan route:clear
php artisan serve --host=127.0.0.1 --port=8000

# Next.js (terminal جديد)
cd vs-nextjs
npm run dev
```

### فحص البورت:

```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# إذا كان البورت محجوز، قم بإنهاء العملية:
taskkill /PID [رقم العملية] /F
```

## ✅ التحقق من النجاح:

1. ✅ `http://localhost:8000/api/categories` يعرض JSON
2. ✅ `http://localhost:3000/debug` يظهر "✅ Online"
3. ✅ `http://localhost:3000/admin/login` يمكن تسجيل الدخول
4. ✅ لا توجد أخطاء في Console

## 🎯 بعد الإصلاح:

جرب تسجيل الدخول مرة أخرى من:
`http://localhost:3000/admin/login`

بالبيانات: admin / admin123