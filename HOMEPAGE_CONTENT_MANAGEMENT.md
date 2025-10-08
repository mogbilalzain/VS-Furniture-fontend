# Homepage Content Management System

## Overview

A dynamic system has been created to manage homepage content, especially the "REAL SPACES, REAL STORIES" section. Administrators can now add, edit, and delete content through the admin panel.

## New Features

### 1. Dynamic Content Management
- Add new content (videos, images, text)
- Edit existing content
- Delete content
- Activate/deactivate content
- Sort content

### 2. Support for Different Content Types
- **YouTube Videos**: By entering YouTube URL
- **Uploaded Videos**: Upload video files directly (up to 50MB)
- **Images**: Upload images with optional links
- **Text**: Text content with optional links

### 3. Multiple Sections
- REAL SPACES, REAL STORIES
- Hero Section
- What We Do
- Projects
- Trusted Logos

## How to Use

### Access Admin Panel
1. Login to admin panel: `/admin/login`
2. Navigate to "Content Management": `/admin/homepage-content`

### Add New Content
1. Click "Add New Content"
2. Select the desired section
3. Choose content type (video/image/text)
4. Enter title and description
5. For videos:
   - Enter YouTube URL, or
   - Upload video file from your device
6. Save content

### Edit Content
1. Click "Edit" next to the desired content
2. Modify the required data
3. Save changes

### Delete Content
1. Click "Delete" next to the desired content
2. Confirm deletion

## التقنيات المستخدمة

### Backend (Laravel)
- **Model**: `HomepageContent`
- **Controller**: `HomepageContentController`
- **Migration**: `create_homepage_contents_table`
- **Seeder**: `HomepageContentSeeder`

### Frontend (Next.js)
- **صفحة الإدارة**: `/admin/homepage-content/page.js`
- **مكون العرض**: `RealSpacesSection.js` (محدث ليكون ديناميكي)

### API Endpoints
- `GET /api/homepage-content` - جلب المحتوى (عام)
- `GET /api/admin/homepage-content` - جلب المحتوى (إدارة)
- `POST /api/admin/homepage-content` - إضافة محتوى جديد
- `PUT /api/admin/homepage-content/{id}` - تحديث محتوى
- `DELETE /api/admin/homepage-content/{id}` - حذف محتوى
- `POST /api/admin/homepage-content/reorder` - إعادة ترتيب المحتوى
- `POST /api/admin/homepage-content/upload-video` - رفع فيديو

## قاعدة البيانات

### جدول `homepage_contents`
```sql
- id: معرف فريد
- section: القسم (real_spaces, hero, etc.)
- type: نوع المحتوى (video, image, text)
- title: العنوان
- description: الوصف
- video_url: رابط الفيديو أو مسار الملف المرفوع
- video_id: معرف فيديو YouTube
- thumbnail: مسار صورة المعاينة
- link_url: رابط إضافي
- sort_order: ترتيب العرض
- is_active: حالة التفعيل
- metadata: بيانات إضافية (JSON)
- created_at/updated_at: تواريخ الإنشاء والتحديث
```

## إعداد النظام

### 1. تشغيل Migration
```bash
cd vs-laravel-backend
php artisan migrate
```

### 2. تشغيل Seeder (اختياري)
```bash
php artisan db:seed --class=HomepageContentSeeder
```

### 3. إعداد متغيرات البيئة
تأكد من إعداد `NEXT_PUBLIC_API_URL` في ملف `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. إعداد التخزين
تأكد من إعداد رابط التخزين في Laravel:
```bash
php artisan storage:link
```

## الأمان

- جميع endpoints الإدارية محمية بـ authentication و admin middleware
- رفع الملفات محدود بحجم 50MB للفيديوهات
- التحقق من صيغ الملفات المدعومة
- تنظيف البيانات المدخلة

## الاستكشاف والإصلاح

### مشاكل شائعة
1. **عدم ظهور المحتوى**: تأكد من أن المحتوى مفعل (`is_active = true`)
2. **مشاكل رفع الفيديو**: تأكد من حجم الملف وصيغته
3. **مشاكل API**: تأكد من إعداد `NEXT_PUBLIC_API_URL` بشكل صحيح

### سجلات الأخطاء
- تحقق من console المتصفح للأخطاء في Frontend
- تحقق من `storage/logs/laravel.log` للأخطاء في Backend

## التطوير المستقبلي

### ميزات مقترحة
- إضافة إمكانية السحب والإفلات لإعادة الترتيب
- معاينة مباشرة للمحتوى قبل الحفظ
- إحصائيات المشاهدة للفيديوهات
- دعم المزيد من صيغ الملفات
- نظام الموافقة على المحتوى
- جدولة نشر المحتوى

### تحسينات الأداء
- تحسين تحميل الصور والفيديوهات
- إضافة CDN للملفات المرفوعة
- تحسين استعلامات قاعدة البيانات
- إضافة caching للمحتوى

## الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
