const fs = require('fs');
const path = require('path');

// Translation dictionary
const translations = {
  // Common UI elements
  'تصفية المنتجات': 'Filter Products',
  'مسح الكل': 'Clear All',
  'إعادة المحاولة': 'Try Again',
  'لا توجد خصائص متاحة لهذه الفئة': 'No properties available for this category',
  'اختر خصائص متعددة للحصول على نتائج أكثر دقة': 'Select multiple properties for more accurate results',
  
  // Error messages
  'فشل في تحميل خصائص الفئة': 'Failed to load category properties',
  'حدث خطأ في تحميل الخصائص': 'Error loading properties',
  'فشل في تحميل المنتجات': 'Failed to load products',
  'حدث خطأ في تحميل المنتجات': 'Error loading products',
  'فشل في تحميل ملفات المنتج': 'Failed to load product files',
  'حدث خطأ في تحميل الملفات': 'Error loading files',
  'الفئة غير موجودة': 'Category not found',
  'حدث خطأ في تحميل الفئة': 'Error loading category',
  'المنتج غير موجود': 'Product not found',
  'حدث خطأ في تحميل تفاصيل المنتج': 'Error loading product details',
  
  // Product related
  'منتج مميز': 'Featured Product',
  'مميز': 'Featured',
  'عرض التفاصيل': 'View Details',
  'تفاصيل المنتج': 'Product Details',
  'خصائص المنتج': 'Product Properties',
  'المواصفات التقنية': 'Technical Specifications',
  'الملفات المتاحة': 'Available Files',
  'تحميل': 'Download',
  'جاري التحميل...': 'Downloading...',
  'تم نسخ رابط المنتج': 'Product link copied',
  'طلب عرض سعر': 'Request Quote',
  
  // Categories and properties
  'الفئة': 'Category',
  'الفئات': 'Categories',
  'الخصائص': 'Properties',
  'القيم': 'Values',
  'النوع': 'Type',
  'الموديل': 'Model',
  'الرمز': 'Code',
  'الوصف': 'Description',
  'الوصف المختصر': 'Short Description',
  'الوصف الكامل': 'Full Description',
  
  // Navigation
  'الرئيسية': 'Home',
  'المنتجات': 'Products',
  'البحث في المنتجات...': 'Search products...',
  'العودة للفئات': 'Back to Categories',
  'العودة للمنتجات': 'Back to Products',
  'منتجات ذات صلة': 'Related Products',
  'سيتم عرض المنتجات ذات الصلة هنا': 'Related products will be displayed here',
  
  // Admin interface
  'إدارة الخصائص': 'Manage Properties',
  'إدارة خصائص الفئة': 'Manage Category Properties',
  'إدارة الملفات': 'Manage Files',
  'إدارة ملفات المنتج': 'Manage Product Files',
  'إضافة خاصية جديدة': 'Add New Property',
  'إضافة قيمة جديدة': 'Add New Value',
  'إضافة منتج جديد': 'Add New Product',
  'تعديل المنتج': 'Edit Product',
  'تعديل الخاصية': 'Edit Property',
  'تعديل القيمة': 'Edit Value',
  'حذف الخاصية': 'Delete Property',
  'حذف القيمة': 'Delete Value',
  'حذف الملف': 'Delete File',
  'رفع ملف جديد': 'Upload New File',
  'رفع الملف': 'Upload File',
  'جاري الرفع...': 'Uploading...',
  'جاري الحفظ...': 'Saving...',
  'حفظ': 'Save',
  'إلغاء': 'Cancel',
  'إغلاق': 'Close',
  'تحديث': 'Update',
  'إضافة': 'Add',
  
  // File management
  'كتالوج المنتج': 'Product Catalog',
  'دليل المستخدم': 'User Manual',
  'ضمان المنتج': 'Product Warranty',
  'شهادات الجودة': 'Quality Certificates',
  'رسوم تقنية': 'Technical Drawings',
  'ملفات أخرى': 'Other Files',
  'ملف PDF': 'PDF File',
  'ملف مميز': 'Featured File',
  'متاح للتحميل': 'Available for Download',
  'اسم العرض': 'Display Name',
  'فئة الملف': 'File Category',
  'ترتيب العرض': 'Display Order',
  'الحد الأقصى: 10MB': 'Maximum: 10MB',
  'غير محدد': 'Not specified',
  
  // Form labels
  'اسم المنتج': 'Product Name',
  'اسم الخاصية \\(بالإنجليزية\\)': 'Property Name (English)',
  'القيمة \\(بالإنجليزية\\)': 'Value (English)',
  'نوع الإدخال': 'Input Type',
  'اختيار متعدد': 'Multiple Choice',
  'اختيار واحد': 'Single Choice',
  'قائمة منسدلة': 'Dropdown List',
  'خاصية مطلوبة': 'Required Property',
  'الحالة': 'Status',
  'نشط': 'Active',
  'غير نشط': 'Inactive',
  'رمز المنتج \\(SKU\\)': 'Product Code (SKU)',
  
  // Status messages
  'تم إنشاء الخاصية بنجاح': 'Property created successfully',
  'تم تحديث الخاصية بنجاح': 'Property updated successfully',
  'تم حذف الخاصية بنجاح': 'Property deleted successfully',
  'تم إنشاء القيمة بنجاح': 'Value created successfully',
  'تم تحديث القيمة بنجاح': 'Value updated successfully',
  'تم حذف القيمة بنجاح': 'Value deleted successfully',
  'تم رفع الملف بنجاح': 'File uploaded successfully',
  'تم تحديث الملف بنجاح': 'File updated successfully',
  'تم حذف الملف بنجاح': 'File deleted successfully',
  'فشل في حفظ الخاصية': 'Failed to save property',
  'فشل في حفظ القيمة': 'Failed to save value',
  'فشل في رفع الملف': 'Failed to upload file',
  'فشل في تحديث الملف': 'Failed to update file',
  'فشل في حذف الملف': 'Failed to delete file',
  
  // Confirmation messages
  'هل أنت متأكد من حذف هذه الخاصية\\? سيتم حذف جميع قيمها أيضاً\\.': 'Are you sure you want to delete this property? All its values will also be deleted.',
  'هل أنت متأكد من حذف هذه القيمة\\?': 'Are you sure you want to delete this value?',
  'هل أنت متأكد من حذف هذا الملف\\?': 'Are you sure you want to delete this file?',
  'يرجى اختيار ملف PDF': 'Please select a PDF file',
  
  // Pagination and sorting
  'السابق': 'Previous',
  'التالي': 'Next',
  'الاسم \\(أ-ي\\)': 'Name (A-Z)',
  'الاسم \\(ي-أ\\)': 'Name (Z-A)',
  'الأحدث': 'Newest',
  'الأقدم': 'Oldest',
  'المميزة أولاً': 'Featured First',
  'الأكثر مشاهدة': 'Most Viewed',
  'عرض شبكي': 'Grid View',
  'عرض قائمة': 'List View',
  
  // Empty states
  'لا توجد منتجات': 'No Products',
  'لم يتم العثور على منتجات تطابق معايير البحث الحالية': 'No products found matching current search criteria',
  'لا توجد خصائص': 'No Properties',
  'ابدأ بإضافة خاصية جديدة لهذه الفئة': 'Start by adding a new property for this category',
  'لا توجد قيم لهذه الخاصية': 'No values for this property',
  'لا توجد ملفات': 'No Files',
  'ابدأ برفع ملف PDF للمنتج': 'Start by uploading a PDF file for the product',
  'لا توجد ملفات متاحة لهذا المنتج': 'No files available for this product',
  
  // Suggestions
  'جرب:': 'Try:',
  'تغيير معايير البحث': 'Change search criteria',
  'إزالة بعض الفلاتر': 'Remove some filters',
  'البحث في فئة أخرى': 'Search in another category',
  
  // Counts and statistics
  'منتج': 'product',
  'منتجات': 'products',
  'قيمة': 'value',
  'مشاهدة': 'view',
  'إجمالي الملفات': 'Total Files',
  'إجمالي التحميلات': 'Total Downloads',
  'خصائص أخرى': 'other properties',
  
  // Date and time
  'تاريخ الإضافة': 'Date Added',
  'جميع الملفات بصيغة PDF': 'All files are in PDF format',
  'التحميل مجاني ولا يتطلب تسجيل': 'Download is free and requires no registration',
  'اضغط على أي ملف لتحميله مجاناً': 'Click on any file to download it for free'
};

function translateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply translations
    for (const [arabic, english] of Object.entries(translations)) {
      const regex = new RegExp(arabic, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, english);
        hasChanges = true;
        console.log(`Translated "${arabic}" to "${english}" in ${filePath}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function translateDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const items = fs.readdirSync(dirPath);
  let totalFiles = 0;
  let updatedFiles = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      const result = translateDirectory(fullPath, extensions);
      totalFiles += result.total;
      updatedFiles += result.updated;
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        totalFiles++;
        if (translateFile(fullPath)) {
          updatedFiles++;
        }
      }
    }
  }
  
  return { total: totalFiles, updated: updatedFiles };
}

// Main execution
console.log('🌐 Starting system-wide translation from Arabic to English...\n');

const directories = [
  './components',
  './app',
  './lib'
];

let grandTotal = 0;
let grandUpdated = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processing directory: ${dir}`);
    const result = translateDirectory(dir);
    console.log(`   Files processed: ${result.total}, Updated: ${result.updated}`);
    grandTotal += result.total;
    grandUpdated += result.updated;
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
}

console.log(`\n🎉 Translation complete!`);
console.log(`📊 Total files processed: ${grandTotal}`);
console.log(`✅ Files updated: ${grandUpdated}`);
console.log(`📈 Success rate: ${grandTotal > 0 ? Math.round((grandUpdated / grandTotal) * 100) : 0}%`);