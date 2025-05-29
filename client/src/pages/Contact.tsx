import React from "react";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-neutral-800 mb-12">تواصل معنا</h1>
        
        {/* شجرة الاتصال */}
        <div className="max-w-4xl mx-auto">
          {/* القسم الرئيسي */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative">
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-center text-neutral-800 mb-6">كلية الزراعة - جامعة جنوب الوادي</h2>
            <div className="flex items-center justify-center text-neutral-600 mb-4">
              <MapPin className="w-5 h-5 ml-2" />
              <span>قنا، مصر</span>
            </div>
            <div className="flex items-center justify-center text-neutral-600">
              <Clock className="w-5 h-5 ml-2" />
              <span>من السبت إلى الخميس: 9 صباحاً - 5 مساءً</span>
            </div>
          </div>

          {/* الفروع */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* فرع الهاتف */}
            <div className="bg-white rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center text-neutral-800 mb-4">اتصال هاتفي</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">شئون الطلاب</p>
                  <a href="tel:+201234567890" className="text-primary hover:text-primary-dark font-medium">
                    01234567890
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">شئون أعضاء هيئة التدريس</p>
                  <a href="tel:+201234567891" className="text-primary hover:text-primary-dark font-medium">
                    01234567891
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">شئون الدراسات العليا</p>
                  <a href="tel:+201234567892" className="text-primary hover:text-primary-dark font-medium">
                    01234567892
                  </a>
                </div>
              </div>
            </div>

            {/* فرع البريد الإلكتروني */}
            <div className="bg-white rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center text-neutral-800 mb-4">بريد إلكتروني</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">البريد العام</p>
                  <a href="mailto:info@agri.svu.edu.eg" className="text-primary hover:text-primary-dark font-medium">
                    info@agri.svu.edu.eg
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">دعم الطلاب</p>
                  <a href="mailto:students@agri.svu.edu.eg" className="text-primary hover:text-primary-dark font-medium">
                    students@agri.svu.edu.eg
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">الدراسات العليا</p>
                  <a href="mailto:postgrad@agri.svu.edu.eg" className="text-primary hover:text-primary-dark font-medium">
                    postgrad@agri.svu.edu.eg
                  </a>
                </div>
              </div>
            </div>

            {/* فرع الواتساب */}
            <div className="bg-white rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center text-neutral-800 mb-4">واتساب</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">دعم الطلاب</p>
                  <a 
                    href="https://wa.me/201234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    تواصل عبر واتساب
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">الدراسات العليا</p>
                  <a 
                    href="https://wa.me/201234567891" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    تواصل عبر واتساب
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600 mb-1">شئون أعضاء هيئة التدريس</p>
                  <a 
                    href="https://wa.me/201234567892" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    تواصل عبر واتساب
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 