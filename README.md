# VS Furniture - Next.js Website

تم تحويل موقع VS Furniture من HTML/CSS/JavaScript العادي إلى Next.js مع TailwindCSS وفقاً لمتطلبات .cursorrules.

## 🚀 المميزات

- **Next.js 15** مع App Router
- **JavaScript** (بدلاً من TypeScript حسب تفضيلاتك)
- **TailwindCSS** للتصميم
- **مكونات React** قابلة لإعادة الاستخدام
- **تصميم متجاوب** (Responsive Design)
- **تحسين الأداء** مع Next.js Image optimization
- **انتقالات سلسة** وحركات CSS
- **تجربة مستخدم محسنة** مع accessibility features

## 📁 هيكل المشروع

```
vs-nextjs/
├── app/
│   ├── layout.js                 # Layout عام للموقع
│   ├── page.js                   # الصفحة الرئيسية
│   ├── products/page.js          # صفحة المنتجات
│   ├── services/page.js          # صفحة الخدمات
│   ├── contact/page.js           # صفحة التواصل
│   ├── career/page.js            # صفحة الوظائف
│   └── globals.css               # الأنماط العامة
├── components/
│   ├── Header.js                 # شريط التنقل
│   ├── Footer.js                 # تذييل الصفحة
│   ├── HeroSection.js            # قسم البطل مع الفيديو
│   ├── WhatWeDo.js              # قسم "ماذا نفعل"
│   ├── QuoteSection.js          # قسم الاقتباس
│   ├── TrustedLogos.js          # الشعارات المتحركة
│   ├── ProjectsSection.js       # قسم المشاريع
│   └── RealSpacesSection.js     # قسم "المساحات الحقيقية"
├── public/                       # الصور والأصول
└── package.json                  # تبعيات المشروع
```

## 🎨 الصفحات المتاحة

### 1. الصفحة الرئيسية (`/`)
- فيديو Hero متفاعل
- قسم "What We Do" مع ثلاث بطاقات
- قسم الاقتباس الملهم
- شعارات الشركاء المتحركة
- قسم المشاريع
- قسم "Real Spaces, Real Stories"

### 2. صفحة المنتجات (`/products`)
- عرض شبكي للمنتجات
- تصنيفات المنتجات
- صور محسنة مع Next.js Image

### 3. صفحة الخدمات (`/services`)
- أربع خدمات رئيسية
- قوائم المميزات
- دعوة للعمل (CTA)

### 4. صفحة التواصل (`/contact`)
- نموذج تواصل تفاعلي
- معلومات الاتصال
- روابط وسائل التواصل الاجتماعي

### 5. صفحة الوظائف (`/career`)
- الوظائف المتاحة
- عملية التقديم
- مميزات العمل مع الشركة

## 🛠️ التقنيات المستخدمة

- **Next.js 15** - إطار عمل React
- **React 19** - مكتبة واجهة المستخدم
- **TailwindCSS 4** - إطار عمل CSS
- **JavaScript (ES6+)** - لغة البرمجة
- **FontAwesome** - أيقونات وسائل التواصل
- **Google Fonts** - خط Inter & Georgia

## 🚦 كيفية التشغيل

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. تشغيل خادم التطوير
```bash
npm run dev
```

### 3. فتح المتصفح
افتح [http://localhost:3000](http://localhost:3000) لعرض الموقع.

### 4. البناء للإنتاج
```bash
npm run build
npm start
```

## 🎯 المميزات التفاعلية

### Navigation
- قائمة تنقل متجاوبة
- قائمة جانبية للهواتف المحمولة
- روابط تمرير سلس (Smooth scrolling)

### Animations
- شعارات متحركة بحلقة لا نهائية
- تأثيرات hover على البطاقات
- انتقالات سلسة للألوان والحركة

### Responsiveness
- تصميم متجاوب لجميع الأجهزة
- شبكة CSS Grid و Flexbox
- فيديو متجاوب في Hero section

## 🔧 التخصيص

### الألوان
يمكن تخصيص الألوان من ملف `globals.css`:
```css
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-dark-gray: #3D3D3D;
  --color-medium-gray: #707070;
  --vs-dark-gray: #2c2c2c;
  --vs-yellow: #fbe50f;
}
```

### الخطوط
الخطوط المستخدمة:
- **Georgia** للنصوص العامة
- **Inter** للعناوين والنصوص الحديثة

## 📱 التوافق مع الأجهزة

- ✅ أجهزة سطح المكتب
- ✅ الأجهزة اللوحية
- ✅ الهواتف المحمولة
- ✅ جميع المتصفحات الحديثة

## 🚀 تحسينات الأداء

- تحسين الصور مع Next.js Image
- تحميل كسول للمكونات
- ضغط الأصول
- SEO محسن مع metadata

## 📋 قواعد التطوير المتبعة

وفقاً لملف `.cursorrules`:
- ✅ استخدام JavaScript بدلاً من TypeScript
- ✅ استخدام TailwindCSS للتصميم
- ✅ Early returns للوضوح
- ✅ أسماء وصفية للمتغيرات والدوال
- ✅ استخدام `const` بدلاً من `function`
- ✅ إضافة accessibility features
- ✅ مبدأ DRY (Don't Repeat Yourself)

## 🤝 المساهمة

للمساهمة في المشروع:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى البranch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📞 الدعم

للحصول على الدعم أو الاستفسارات:
- البريد الإلكتروني: info@vsfurniture.com
- الهاتف: +971 6 557 4000
- العنوان: Sharjah, Sultan Industrial Area, UAE

---

© 2023 V/S Furniture. جميع الحقوق محفوظة.
# VS-Furniture-fontend
