import React from "react";
import { Sprout } from "lucide-react";

export default function Horticulture() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sprout className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">قسم البساتين</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          يهتم قسم البساتين بدراسة زراعة وإنتاج المحاصيل البستانية كالفاكهة والخضروات والنباتات الزينة، 
          وتطوير طرق الإنتاج المستدامة وتحسين جودة المنتجات البستانية.
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
              إعداد خريجين مؤهلين في مجال علوم البساتين
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير طرق الإنتاج البستاني المستدامة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين جودة المنتجات البستانية
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              خدمة المجتمع من خلال البحوث والدراسات
            </li>
          </ul>
        </div>

        {/* التخصصات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">التخصصات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              إنتاج الفاكهة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              إنتاج الخضروات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              نباتات الزينة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تنسيق الحدائق
            </li>
          </ul>
        </div>

        {/* المختبرات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المختبرات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر زراعة الأنسجة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر فسيولوجيا النبات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر تحليل التربة والمياه
            </li>
          </ul>
        </div>

        {/* المشاريع البحثية */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المشاريع البحثية</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير أصناف جديدة من الفاكهة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين طرق الري في البساتين
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              دراسة تأثير التغيرات المناخية على المحاصيل البستانية
            </li>
          </ul>
        </div>
      </div>

      {/* أعضاء هيئة التدريس */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">أعضاء هيئة التدريس</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* يمكن إضافة بطاقات أعضاء هيئة التدريس هنا */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. أحمد محمد</h3>
            <p className="text-neutral-600">أستاذ مساعد - إنتاج الفاكهة</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. سارة أحمد</h3>
            <p className="text-neutral-600">أستاذ - نباتات الزينة</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. محمد علي</h3>
            <p className="text-neutral-600">أستاذ مساعد - إنتاج الخضروات</p>
          </div>
        </div>
      </div>
    </div>
  );
} 