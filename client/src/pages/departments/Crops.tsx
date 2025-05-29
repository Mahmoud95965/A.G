import React from "react";
import { Globe } from "lucide-react";

export default function Crops() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">قسم المحاصيل</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          يختص قسم المحاصيل بدراسة طرق زراعة وإنتاج المحاصيل الحقلية وتحسين جودتها وإنتاجيتها، 
          وتطوير أصناف جديدة مقاومة للظروف البيئية المختلفة.
        </p>
      </div>

      {/* محتوى القسم */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* الأهداف */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">أهداف القسم</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              إعداد خريجين مؤهلين في مجال علوم المحاصيل
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير أصناف محاصيل جديدة عالية الإنتاجية
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين طرق الزراعة المستدامة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              إجراء البحوث التطبيقية لحل مشاكل المزارعين
            </li>
          </ul>
        </div>

        {/* التخصصات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">التخصصات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              محاصيل الحبوب
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              محاصيل الألياف
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              محاصيل الزيوت
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              محاصيل العلف
            </li>
          </ul>
        </div>

        {/* المختبرات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المختبرات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر فسيولوجيا المحاصيل
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر تحليل البذور
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر تربية المحاصيل
            </li>
          </ul>
        </div>

        {/* المشاريع البحثية */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المشاريع البحثية</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير أصناف قمح مقاومة للجفاف
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين إنتاجية محاصيل العلف
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              دراسة تأثير التغيرات المناخية على المحاصيل الحقلية
            </li>
          </ul>
        </div>
      </div>

      {/* أعضاء هيئة التدريس */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">أعضاء هيئة التدريس</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. محمود علي</h3>
            <p className="text-neutral-600">أستاذ - محاصيل الحبوب</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. فاطمة أحمد</h3>
            <p className="text-neutral-600">أستاذ مساعد - محاصيل الألياف</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. خالد محمد</h3>
            <p className="text-neutral-600">أستاذ - محاصيل الزيوت</p>
          </div>
        </div>
      </div>
    </div>
  );
} 