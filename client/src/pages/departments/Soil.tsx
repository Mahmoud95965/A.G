import React from "react";
import { FlaskRound } from "lucide-react";

export default function Soil() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FlaskRound className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">قسم علوم الأراضي والمياه</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          يهتم قسم علوم الأراضي والمياه بدراسة خواص التربة الزراعية وتحسينها وإدارة الموارد المائية بكفاءة، 
          وتطوير طرق مستدامة لاستخدام الأراضي والمياه في الزراعة.
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
              إعداد خريجين مؤهلين في مجال علوم التربة والمياه
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين خواص التربة وزيادة خصوبتها
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير طرق الري الحديثة والمستدامة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              حماية الموارد المائية من التلوث
            </li>
          </ul>
        </div>

        {/* التخصصات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">التخصصات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              علوم التربة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              إدارة المياه
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              الأراضي المتأثرة بالأملاح
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تكنولوجيا الري
            </li>
          </ul>
        </div>

        {/* المختبرات */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المختبرات</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر تحليل التربة
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر تحليل المياه
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              مختبر الأراضي المتأثرة بالأملاح
            </li>
          </ul>
        </div>

        {/* المشاريع البحثية */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">المشاريع البحثية</h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تحسين خواص التربة المتأثرة بالأملاح
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              تطوير طرق الري بالتنقيط
            </li>
            <li className="flex items-start">
              <span className="text-primary ml-2">•</span>
              دراسة تأثير التغيرات المناخية على موارد المياه
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
            <h3 className="font-bold text-neutral-800 mb-2">د. علي محمود</h3>
            <p className="text-neutral-600">أستاذ - علوم التربة</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. نادية محمد</h3>
            <p className="text-neutral-600">أستاذ مساعد - إدارة المياه</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-neutral-800 mb-2">د. حسين أحمد</h3>
            <p className="text-neutral-600">أستاذ - تكنولوجيا الري</p>
          </div>
        </div>
      </div>
    </div>
  );
} 