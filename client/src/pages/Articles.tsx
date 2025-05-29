import React, { useState, useEffect } from "react";
import { getContentByType } from "@/lib/firebase";
import ContentCard from "@/components/content/ContentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ContentType, Department } from "@shared/schema";
import { DocumentData } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getContentByType(ContentType.ARTICLE);
        setArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    let filtered = [...articles];
    
    // Apply department filter
    if (filter && filter !== 'all') {
      filtered = filtered.filter(article => article.department === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article => 
          article.title.toLowerCase().includes(query) || 
          article.description.toLowerCase().includes(query) ||
          article.authorName.toLowerCase().includes(query)
      );
    }
    
    setFilteredArticles(filtered);
  }, [filter, searchQuery, articles]);

  const departmentNames: Record<string, string> = {
    [Department.HORTICULTURE]: "البساتين",
    [Department.CROPS]: "المحاصيل",
    [Department.SOIL]: "الأراضي والمياه",
    [Department.PROTECTION]: "وقاية النبات",
    [Department.OTHER]: "أخرى"
  };

  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">المقالات العلمية</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            استعرض أحدث المقالات والأبحاث العلمية في مجالات العلوم الزراعية المختلفة
          </p>
        </div>
        
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            placeholder="ابحث عن مقال..."
            className="w-full md:w-96 bg-white border border-neutral-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select onValueChange={setFilter} value={filter}>
            <SelectTrigger className="w-full md:w-64 bg-white border border-neutral-300">
              <SelectValue placeholder="جميع الأقسام" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {Object.entries(departmentNames).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
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
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ContentCard key={article.id} content={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-neutral-900">لا توجد مقالات متاحة</h2>
            <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
              لم يتم العثور على أي مقالات تطابق معايير البحث. يرجى تغيير المعايير أو التحقق لاحقًا.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
