import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import facultyCampusImage from "@/assets/faculty_campus.jpeg";

export default function HomeHero() {
  return (
    <section className="bg-gradient-to-l from-primary-dark to-primary py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">منصة كلية الزراعة بقنا</h1>
            <p className="text-neutral-100 text-lg mb-6">
              بوابتك الإلكترونية للوصول إلى المصادر التعليمية والأكاديمية في مجال العلوم الزراعية
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/articles">
                <Button className="bg-white text-primary font-bold py-2 px-6 rounded-lg shadow-md hover:bg-neutral-100 transition-colors">
                  استكشف المصادر
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="bg-transparent text-white border-2 border-white font-bold py-2 px-6 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                  تعرف علينا
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src={facultyCampusImage} 
              className="w-full max-w-md mx-auto rounded-xl shadow-lg" 
              alt="صورة لحرم كلية الزراعة بقنا"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
