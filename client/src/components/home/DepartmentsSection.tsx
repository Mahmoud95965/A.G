import React from "react";
import { Link } from "wouter";
import { Globe, Sprout, FlaskRound, Shield } from "lucide-react";

export default function DepartmentsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 text-center mb-10">أقسام الكلية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department 1 - Horticulture */}
          <div className="bg-neutral-100 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">البساتين</h3>
            <p className="text-neutral-600 text-sm mb-4">يهتم بدراسة زراعة وإنتاج المحاصيل البستانية كالفاكهة والخضروات والنباتات الزينة.</p>
            <Link href="/departments/horticulture">
              <span className="text-primary font-medium hover:text-primary-dark text-sm inline-flex items-center justify-center transition-colors cursor-pointer">
                عرض محتوى القسم
                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
          
          {/* Department 2 - Crops */}
          <div className="bg-neutral-100 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">المحاصيل</h3>
            <p className="text-neutral-600 text-sm mb-4">يختص بدراسة طرق زراعة وإنتاج المحاصيل الحقلية وتحسين جودتها وإنتاجيتها.</p>
            <Link href="/departments/crops">
              <span className="text-primary font-medium hover:text-primary-dark text-sm inline-flex items-center justify-center transition-colors cursor-pointer">
                عرض محتوى القسم
                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
          
          {/* Department 3 - Soil */}
          <div className="bg-neutral-100 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskRound className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">علوم الأراضي والمياه</h3>
            <p className="text-neutral-600 text-sm mb-4">يهتم بدراسة خواص التربة الزراعية وتحسينها وإدارة الموارد المائية بكفاءة.</p>
            <Link href="/departments/soil">
              <span className="text-primary font-medium hover:text-primary-dark text-sm inline-flex items-center justify-center transition-colors cursor-pointer">
                عرض محتوى القسم
                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
          
          {/* Department 4 - Protection */}
          <div className="bg-neutral-100 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">وقاية النبات</h3>
            <p className="text-neutral-600 text-sm mb-4">يختص بدراسة الآفات والأمراض التي تصيب النباتات وطرق مكافحتها والوقاية منها.</p>
            <Link href="/departments/protection">
              <span className="text-primary font-medium hover:text-primary-dark text-sm inline-flex items-center justify-center transition-colors cursor-pointer">
                عرض محتوى القسم
                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/departments">
            <span className="text-primary-dark font-medium hover:text-primary inline-flex items-center justify-center transition-colors cursor-pointer">
              عرض جميع الأقسام
              <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
