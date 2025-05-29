import React from "react";
import { Shield } from "lucide-react";

export default function Protection() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">قسم وقاية النبات</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          يختص قسم وقاية النبات بدراسة الآفات والأمراض التي تصيب النباتات وطرق مكافحتها والوقاية منها، 
          وتطوير طرق المكافحة المتكاملة والمستدامة.
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
              إعداد خريجين مؤهلين في مجال وقاية النبات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير طرق المكافحة المتكاملة للآفات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تقليل استخدام المبيدات الكيميائية
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              حماية المحاصيل من الأمراض والآفات
            </li>
          </ul>
        </div>

        {/* التخصصات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">التخصصات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              أمراض النبات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              الحشرات الاقتصادية
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              المكافحة الحيوية
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              المبيدات
            </li>
          </ul>
        </div>

        {/* المختبرات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المختبرات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر أمراض النبات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر الحشرات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر المكافحة الحيوية
            </li>
          </ul>
        </div>

        {/* المشاريع البحثية */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المشاريع البحثية</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير طرق المكافحة الحيوية للآفات
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              دراسة مقاومة النباتات للأمراض
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير مبيدات آمنة بيئياً
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
            <h3 className="font-bold text-neutral-800 mb-2">د. محمد سعيد</h3>
            <p className="text-neutral-600">أستاذ - أمراض النبات</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. أسماء محمود</h3>
            <p className="text-neutral-600">أستاذ مساعد - الحشرات الاقتصادية</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. أحمد علي</h3>
            <p className="text-neutral-600">أستاذ - المكافحة الحيوية</p>
          </div>
        </div>
      </div>
    </div>
  );
} 