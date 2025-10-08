# تشغيل المشروع باستخدام Docker

## المتطلبات
- Docker Desktop مثبت ومشغل
- Git (اختياري)

## طرق التشغيل

### 1. التشغيل السريع (Windows)
```bash
# للتطوير
./run-docker.bat

# للإنتاج
./run-docker-prod.bat
```

### 2. التشغيل اليدوي

#### وضع التطوير
```bash
# تشغيل وضع التطوير مع إعادة التحميل التلقائي
docker-compose --profile dev up --build

# أو في الخلفية
docker-compose --profile dev up --build -d
```

#### وضع الإنتاج
```bash
# تشغيل وضع الإنتاج
docker-compose --profile prod up --build

# أو في الخلفية
docker-compose --profile prod up --build -d
```

### 3. البناء المنفصل
```bash
# بناء حاوية التطوير
docker build -f Dockerfile.dev -t nextjs-dev .

# تشغيل حاوية التطوير
docker run -p 3000:3000 -v ${PWD}:/app -v /app/node_modules nextjs-dev

# بناء حاوية الإنتاج
docker build -f Dockerfile -t nextjs-prod .

# تشغيل حاوية الإنتاج
docker run -p 3000:3000 nextjs-prod
```

## الوصول للتطبيق
- التطبيق متاح على: http://localhost:3000
- في وضع التطوير: يتم إعادة التحميل التلقائي عند تعديل الملفات
- في وضع الإنتاج: تطبيق محسن للأداء

## إيقاف الحاويات
```bash
# إيقاف الحاويات
docker-compose down

# إيقاف وحذف البيانات
docker-compose down -v

# تنظيف شامل
docker system prune -a
```

## استكشاف الأخطاء

### Docker لا يعمل
1. تأكد من تشغيل Docker Desktop
2. أعد تشغيل Docker Desktop إذا لزم الأمر

### مشاكل البناء
```bash
# تنظيف الذاكرة التخزينية
docker system prune -a

# إعادة البناء بدون cache
docker-compose build --no-cache
```

### مشاكل المنافذ
```bash
# تحقق من المنافذ المستخدمة
netstat -an | findstr :3000

# إيقاف العمليات على المنفذ 3000
taskkill /F /IM node.exe
```

## الملفات المهمة
- `docker-compose.yml`: إعدادات Docker Compose
- `Dockerfile`: حاوية الإنتاج
- `Dockerfile.dev`: حاوية التطوير
- `.dockerignore`: الملفات المستبعدة من البناء
- `next.config.js`: إعدادات Next.js مع `output: 'standalone'`

## نصائح
- استخدم وضع التطوير أثناء البرمجة
- استخدم وضع الإنتاج للاختبار النهائي
- احفظ البيانات المهمة خارج الحاوية
- راقب استهلاك الموارد في Docker Desktop

