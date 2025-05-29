import React from "react";
import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-bold mb-4">كلية الزراعة بقنا</h3>
            <p className="text-neutral-400 mb-4">
              منصة تعليمية إلكترونية توفر مصادر علمية وأكاديمية في مجالات العلوم الزراعية المختلفة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a 
                href="#" 
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">الصفحة الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">المقالات العلمية</span>
                </Link>
              </li>
              <li>
                <Link href="/projects">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">مشاريع التخرج</span>
                </Link>
              </li>
              <li>
                <Link href="/ebooks">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">المكتبة الإلكترونية</span>
                </Link>
              </li>
              <li>
                <Link href="/departments">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">الأقسام</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-bold mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/faq">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">الأسئلة الشائعة</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">اتصل بنا</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">الشروط والأحكام</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">سياسة الخصوصية</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4 */}
          <div>
            <h3 className="text-lg font-bold mb-4">اتصل بنا</h3>
            <div className="space-y-3">
              <p className="flex items-start text-neutral-400">
                <MapPin className="w-5 h-5 ml-2 text-neutral-500 shrink-0" />
                <span>كلية الزراعة، جامعة جنوب الوادي، قنا، مصر</span>
              </p>
              <p className="flex items-start text-neutral-400">
                <Mail className="w-5 h-5 ml-2 text-neutral-500 shrink-0" />
                <span>info@qena-agri.edu.eg</span>
              </p>
              <p className="flex items-start text-neutral-400">
                <Phone className="w-5 h-5 ml-2 text-neutral-500 shrink-0" />
                <span>+20 9634 XXXX</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-neutral-700 text-center text-neutral-400 text-sm">
          <p>© {new Date().getFullYear()} كلية الزراعة بقنا - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
