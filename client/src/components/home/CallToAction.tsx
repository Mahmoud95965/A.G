import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface CallToActionProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function CallToAction({ onOpenLogin, onOpenSignup }: CallToActionProps) {
  const { user } = useAuth();

  // If user is already logged in, don't show the call to action
  if (user) {
    return null;
  }

  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">انضم إلى منصة كلية الزراعة اليوم</h2>
              <p className="text-neutral-600 mb-6">سجل الآن للوصول إلى مكتبة ضخمة من المصادر العلمية والأكاديمية في مجال العلوم الزراعية.</p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                  onClick={onOpenSignup}
                >
                  إنشاء حساب جديد
                </Button>
                <Button 
                  variant="outline"
                  className="bg-transparent text-primary border-2 border-primary font-bold py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
                  onClick={onOpenLogin}
                >
                  تسجيل الدخول
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 relative">
              <img 
                src="https://images.unsplash.com/photo-1528825871115-3581a5387919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=100%&q=80" 
                className="w-full h-64 md:h-full object-cover" 
                alt="صورة لحرم جامعي"
              />
              <div className="absolute inset-0 bg-primary bg-opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
