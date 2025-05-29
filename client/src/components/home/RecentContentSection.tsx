import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContentCard from "@/components/content/ContentCard";
import { getRecentContent } from "@/lib/firebase";
import { ContentType } from "@shared/schema";
import { DocumentData } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentContentSection() {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const recentContent = await getRecentContent(6);
        setContentItems(recentContent);
        setFilteredItems(recentContent);
      } catch (error) {
        console.error("Error fetching recent content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    
    if (value === "all") {
      setFilteredItems(contentItems);
    } else {
      setFilteredItems(contentItems.filter(item => item.contentType === value));
    }
  };

  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">أحدث المحتويات</h2>
          <div className="mt-4 md:mt-0">
            <Select onValueChange={handleFilterChange} defaultValue="all">
              <SelectTrigger className="bg-white border border-neutral-300 text-neutral-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                <SelectValue placeholder="جميع المحتويات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحتويات</SelectItem>
                <SelectItem value="article">المقالات العلمية</SelectItem>
                <SelectItem value="ebook">الكتب الإلكترونية</SelectItem>
                <SelectItem value="project">مشاريع التخرج</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-neutral-600 text-lg">لا يوجد محتوى متاح في هذه الفئة حاليًا</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Button
            variant="outline"
            className="bg-white text-primary border border-primary hover:bg-primary hover:text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            onClick={() => {
              switch (filter) {
                case ContentType.ARTICLE:
                  window.location.href = "/articles";
                  break;
                case ContentType.EBOOK:
                  window.location.href = "/ebooks";
                  break;
                case ContentType.PROJECT:
                  window.location.href = "/projects";
                  break;
                default:
                  window.location.href = "/articles";
              }
            }}
          >
            عرض المزيد
          </Button>
        </div>
      </div>
    </section>
  );
}
