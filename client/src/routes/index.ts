import { FC } from 'react';
import Home from "@/pages/Home";
import Articles from "@/pages/Articles";
import GraduationProjects from "@/pages/GraduationProjects";
import EBooks from "@/pages/EBooks";
import Departments from "@/pages/Departments";
import Horticulture from "@/pages/departments/Horticulture";
import Crops from "@/pages/departments/Crops";
import Soil from "@/pages/departments/Soil";
import Protection from "@/pages/departments/Protection";
import DepartmentContent from "@/pages/departments/DepartmentContent";
import SubmitResearch from "@/pages/departments/SubmitResearch";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageContent from "@/pages/admin/ManageContent";
import ManageUsers from "@/pages/admin/ManageUsers";
import CreateAdmin from "@/pages/admin/CreateAdmin";
import AdminActions from "@/scripts/AdminActions";
import UploadResults from "@/pages/admin/UploadResults";
import ViewResults from "@/pages/admin/ViewResults";
import StudentResults from "@/pages/student/Results";
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import FAQ from "@/pages/legal/FAQ";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

interface RouteConfig {
  path: string;
  component: FC<any>;
}

export const routes: Record<string, RouteConfig> = {
  // الصفحة الرئيسية
  home: {
    path: "/",
    component: Home,
  },

  // صفحات المحتوى
  articles: {
    path: "/articles",
    component: Articles,
  },
  projects: {
    path: "/projects",
    component: GraduationProjects,
  },
  ebooks: {
    path: "/ebooks",
    component: EBooks,
  },

  // صفحات الأقسام
  departments: {
    path: "/departments",
    component: Departments,
  },
  horticulture: {
    path: "/departments/horticulture",
    component: Horticulture,
  },
  horticultureContent: {
    path: "/departments/horticulture/content",
    component: () => DepartmentContent({ departmentId: "horticulture", departmentName: "قسم البساتين" }),
  },
  horticultureSubmit: {
    path: "/departments/horticulture/submit-research",
    component: () => SubmitResearch({ departmentId: "horticulture", departmentName: "قسم البساتين" }),
  },
  crops: {
    path: "/departments/crops",
    component: Crops,
  },
  cropsContent: {
    path: "/departments/crops/content",
    component: () => DepartmentContent({ departmentId: "crops", departmentName: "قسم المحاصيل" }),
  },
  cropsSubmit: {
    path: "/departments/crops/submit-research",
    component: () => SubmitResearch({ departmentId: "crops", departmentName: "قسم المحاصيل" }),
  },
  soil: {
    path: "/departments/soil",
    component: Soil,
  },
  soilContent: {
    path: "/departments/soil/content",
    component: () => DepartmentContent({ departmentId: "soil", departmentName: "قسم الأراضي والمياه" }),
  },
  soilSubmit: {
    path: "/departments/soil/submit-research",
    component: () => SubmitResearch({ departmentId: "soil", departmentName: "قسم الأراضي والمياه" }),
  },
  protection: {
    path: "/departments/protection",
    component: Protection,
  },
  protectionContent: {
    path: "/departments/protection/content",
    component: () => DepartmentContent({ departmentId: "protection", departmentName: "قسم وقاية النبات" }),
  },
  protectionSubmit: {
    path: "/departments/protection/submit-research",
    component: () => SubmitResearch({ departmentId: "protection", departmentName: "قسم وقاية النبات" }),
  },

  // صفحة الملف الشخصي
  profile: {
    path: "/profile",
    component: Profile,
  },

  // صفحات المسؤول
  adminDashboard: {
    path: "/admin/dashboard",
    component: AdminDashboard,
  },
  adminContent: {
    path: "/admin/content",
    component: ManageContent,
  },
  adminUsers: {
    path: "/admin/users",
    component: ManageUsers,
  },
  adminCreate: {
    path: "/admin/create-admin",
    component: CreateAdmin,
  },
  adminActions: {
    path: "/admin/actions",
    component: AdminActions,
  },
  adminUploadResults: {
    path: "/admin/upload-results",
    component: UploadResults,
  },
  adminViewResults: {
    path: "/admin/view-results",
    component: ViewResults,
  },

  // صفحات الطالب
  studentResults: {
    path: "/student/results",
    component: StudentResults,
  },

  // صفحات قانونية
  terms: {
    path: "/legal/terms",
    component: Terms,
  },
  privacy: {
    path: "/legal/privacy",
    component: Privacy,
  },
  faq: {
    path: "/legal/faq",
    component: FAQ,
  },
  contact: {
    path: "/contact",
    component: Contact,
  },

  // صفحة 404
  notFound: {
    path: "*",
    component: NotFound,
  },
}; 