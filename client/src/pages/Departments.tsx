import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sprout, FlaskRound, Shield, Leaf, Wheat, Droplets, Bug, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Departments() {
  const { user } = useAuth();
  
  const departments = [
    {
      id: "horticulture",
      name: "قسم البساتين",
      description: "يهتم بدراسة وإنتاج محاصيل الفاكهة والخضر ونباتات الزينة",
      icon: <FlaskRound className="w-12 h-12 text-primary" />,
      path: "/departments/horticulture",
      contentPath: "/departments/horticulture/content"
    },
    {
      id: "crops",
      name: "قسم المحاصيل",
      description: "يهتم بدراسة وإنتاج المحاصيل الحقلية المختلفة",
      icon: <FlaskRound className="w-12 h-12 text-primary" />,
      path: "/departments/crops",
      contentPath: "/departments/crops/content"
    },
    {
      id: "soil",
      name: "قسم الأراضي والمياه",
      description: "يهتم بدراسة علوم التربة والمياه وإدارتها",
      icon: <FlaskRound className="w-12 h-12 text-primary" />,
      path: "/departments/soil",
      contentPath: "/departments/soil/content"
    },
    {
      id: "protection",
      name: "قسم وقاية النبات",
      description: "يهتم بدراسة أمراض وآفات النباتات وطرق مكافحتها",
      icon: <FlaskRound className="w-12 h-12 text-primary" />,
      path: "/departments/protection",
      contentPath: "/departments/protection/content"
    },
    {
      id: "dairy",
      name: "الألبان",
      description: "يتضمن دراسة تكنولوجيا إنتاج وتصنيع منتجات الألبان ومراقبة جودتها وسلامتها الغذائية.",
      icon: <FlaskRound className="w-10 h-10 text-primary" />,
      features: ["تكنولوجيا الألبان", "ميكروبيولوجيا الألبان", "كيمياء الألبان", "جودة وسلامة المنتجات"],
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "economy",
      name: "الاقتصاد الزراعي",
      description: "يدرس الجوانب الاقتصادية والإدارية للمشاريع الزراعية وتسويق المنتجات الزراعية والتنمية الريفية.",
      icon: <Globe className="w-10 h-10 text-primary" />,
      features: ["اقتصاد زراعي", "إدارة مزارع", "تسويق زراعي", "تنمية ريفية"],
      image: "https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "genetics",
      name: "الوراثة",
      description: "يختص بدراسة أساسيات علم الوراثة وتطبيقاتها في تحسين السلالات النباتية والتكنولوجيا الحيوية.",
      icon: <Leaf className="w-10 h-10 text-primary" />,
      features: ["وراثة جزيئية", "هندسة وراثية", "تكنولوجيا حيوية", "تحسين وراثي"],
      image: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "entomology",
      name: "الحشرات الاقتصادية",
      description: "يهتم بدراسة الحشرات ذات الأهمية الاقتصادية وتصنيفها وبيئتها وطرق مكافحتها.",
      icon: <Bug className="w-10 h-10 text-primary" />,
      features: ["تصنيف حشرات", "بيئة حشرات", "مكافحة آفات", "حشرات نافعة"],
      image: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">أقسام كلية الزراعة</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            تعرف على الأقسام المختلفة في كلية الزراعة بقنا والتخصصات العلمية التي تقدمها
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                  <div className="flex-shrink-0">
                    {dept.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{dept.name}</h2>
                    <p className="text-muted-foreground">{dept.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link href={dept.path || '#'}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <FileText className="w-4 h-4 ml-2" />
                      عرض القسم
                    </Button>
                  </Link>
                  
                  <Link href={dept.contentPath || '#'}>
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <FileText className="w-4 h-4 ml-2" />
                      محتوى القسم
                    </Button>
                  </Link>
                  
                  {user && (
                    <Link to={`${dept.path}/submit-research`}>
                      <Button variant="default" className="w-full sm:w-auto">
                        <Upload className="w-4 h-4 ml-2" />
                        تقديم بحث
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
