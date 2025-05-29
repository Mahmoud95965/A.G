import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  File, 
  Users, 
  Pencil, 
  Trash2, 
  Search, 
  Upload, 
  LayoutDashboard,
  UserPlus,
  UserCheck,
  GraduationCap,
  User
} from "lucide-react";
import { createUsersFromExcel, db, updateUserRole } from "@/lib/firebase";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  doc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const userRoleLabels: Record<string, string> = {
  [UserRole.STUDENT]: "طالب",
  [UserRole.PROFESSOR]: "دكتور",
  [UserRole.ADMIN]: "مسؤول",
};

const departmentLabels: Record<string, string> = {
  "horticulture": "البساتين",
  "crops": "المحاصيل",
  "soil": "الأراضي والمياه",
  "protection": "وقاية النبات",
  "other": "أخرى",
};

interface UploadProgressState {
  total: number;
  current: number;
  success: number;
  failed: number;
}

export default function ManageUsers() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [usersList, setUsersList] = useState<DocumentData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    total: 0,
    current: 0,
    success: 0,
    failed: 0
  });
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "غير مصرح بالوصول",
        description: "هذه الصفحة متاحة فقط للمسؤولين",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, navigate, toast]);

  // Load users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        const usersRef = collection(db, "users");
        let q = query(usersRef, orderBy("createdAt", "desc"), limit(20));
        
        const querySnapshot = await getDocs(q);
        const users: DocumentData[] = [];
        
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        
        setUsersList(users);
        setFilteredUsers(users);
        
        if (querySnapshot.docs.length > 0) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل قائمة المستخدمين",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, toast]);

  // Filter users based on tab and search query
  useEffect(() => {
    if (activeTab === "all") {
      if (searchQuery) {
        const filtered = usersList.filter(
          user => 
            (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) || 
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(usersList);
      }
    } else {
      let filtered = usersList.filter(user => user.role === activeTab);
      
      if (searchQuery) {
        filtered = filtered.filter(
          user => 
            (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) || 
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      setFilteredUsers(filtered);
    }
  }, [activeTab, searchQuery, usersList]);

  const loadMore = async () => {
    if (!lastVisible) return;
    
    try {
      setIsLoading(true);
      
      const usersRef = collection(db, "users");
      let q = query(usersRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(20));
      
      const querySnapshot = await getDocs(q);
      const newUsers: DocumentData[] = [];
      
      querySnapshot.forEach((doc) => {
        newUsers.push({ id: doc.id, ...doc.data() });
      });
      
      if (newUsers.length === 0) {
        setHasMore(false);
      } else {
        setUsersList([...usersList, ...newUsers]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error loading more users:", error);
      toast({
        title: "خطأ في تحميل المزيد",
        description: "حدث خطأ أثناء تحميل المزيد من المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", selectedUser.id));
      
      // Note: Deleting from Firebase Auth requires Cloud Functions or admin SDK
      // This only removes the user from Firestore
      
      toast({
        title: "تم حذف المستخدم بنجاح",
        description: "تم حذف بيانات المستخدم من قاعدة البيانات",
      });
      
      // Remove from state
      const updatedList = usersList.filter(user => user.id !== selectedUser.id);
      setUsersList(updatedList);
      setFilteredUsers(updatedList);
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ في حذف المستخدم",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser.uid, newRole);
      
      toast({
        title: "تم تغيير الصلاحية بنجاح",
        description: "تم تغيير صلاحية المستخدم بنجاح",
      });
      
      // Update in state
      const updatedList = usersList.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, role: newRole };
        }
        return user;
      });
      
      setUsersList(updatedList);
      setFilteredUsers(updatedList);
      
      // Close dialog
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({
        title: "خطأ في تغيير الصلاحية",
        description: "حدث خطأ أثناء تغيير صلاحية المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف Excel أولاً",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress({
      total: 0,
      current: 0,
      success: 0,
      failed: 0
    });
    
    try {
      // Process Excel file with progress updates
      const result = await createUsersFromExcel(excelFile, (progress) => {
        setUploadProgress({
          total: progress.total,
          current: progress.current,
          success: progress.success,
          failed: progress.failed
        });
      });
      
      // حساب النسب المئوية
      const totalUsers = result.success.length + result.failed.length;
      const successPercentage = Math.round((result.success.length / totalUsers) * 100);
      const failedPercentage = Math.round((result.failed.length / totalUsers) * 100);
      
      // عرض ملخص النتائج
      if (result.failed.length === 0) {
        toast({
          title: "تم إنشاء المستخدمين بنجاح",
          description: `تم إنشاء ${result.success.length} مستخدم بنجاح (100%)`,
        });
      } else if (result.success.length === 0) {
        toast({
          title: "لم يتم إنشاء أي مستخدمين",
          description: `جميع المستخدمين مسجلين بالفعل (${failedPercentage}%)`,
          variant: "default",
        });
      } else {
        toast({
          title: "تم إنشاء بعض المستخدمين",
          description: (
            <div className="space-y-1">
              <p>تم إنشاء {result.success.length} مستخدم بنجاح ({successPercentage}%)</p>
              <p>{result.failed.length} مستخدم مسجلين بالفعل ({failedPercentage}%)</p>
            </div>
          ),
          variant: "default",
        });
      }
      
      // Close dialog after successful upload
      if (result.success.length > 0) {
        setTimeout(async () => {
          setIsUploadDialogOpen(false);
          setExcelFile(null);
          
          // Refresh users list
          const usersRef = collection(db, "users");
          const q = query(usersRef, orderBy("createdAt", "desc"), limit(20));
          const querySnapshot = await getDocs(q);
          
          const users: DocumentData[] = [];
          querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
          });
          
          setUsersList(users);
          setFilteredUsers(users);
          
          if (querySnapshot.docs.length > 0) {
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
          }
        }, 2000);
      } else {
        // إذا لم يتم إنشاء أي مستخدمين، أغلق النافذة بعد عرض النتائج
        setTimeout(() => {
          setIsUploadDialogOpen(false);
          setExcelFile(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast({
        title: "خطأ في معالجة الملف",
        description: "حدث خطأ أثناء معالجة ملف Excel",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = (user: DocumentData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openRoleDialog = (user: DocumentData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-800 mb-4">لوحة التحكم</h2>
              <nav className="space-y-2">
                <Link href="/admin/dashboard">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                    <LayoutDashboard className="w-5 h-5 ml-2" />
                    الرئيسية
                  </span>
                </Link>
                <Link href="/admin/content">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                    <File className="w-5 h-5 ml-2" />
                    إدارة المحتوى
                  </span>
                </Link>
                <Link href="/admin/users">
                  <span className="flex items-center p-2 text-neutral-700 rounded-md bg-neutral-100 font-medium cursor-pointer">
                    <Users className="w-5 h-5 ml-2" />
                    إدارة المستخدمين
                  </span>
                </Link>
              </nav>
            </div>
            
            <div className="pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">إدارة المستخدمين</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="w-full flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع ملف Excel
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">إدارة المستخدمين</h1>
                <p className="text-neutral-600">إدارة المستخدمين وتعيين الصلاحيات</p>
              </div>
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-primary hover:bg-primary-dark"
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع ملف Excel
              </Button>
            </div>
            
            {/* Users List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>قائمة المستخدمين</CardTitle>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                      placeholder="بحث..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value={UserRole.STUDENT}>الطلاب</TabsTrigger>
                    <TabsTrigger value={UserRole.PROFESSOR}>الدكاترة</TabsTrigger>
                    <TabsTrigger value={UserRole.ADMIN}>المسؤولين</TabsTrigger>
                  </TabsList>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المستخدم</TableHead>
                          <TableHead>البريد الإلكتروني</TableHead>
                          <TableHead>الصلاحية</TableHead>
                          <TableHead>القسم</TableHead>
                          <TableHead>تاريخ التسجيل</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              جارٍ تحميل البيانات...
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-reverse space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.profilePicture} alt={user.displayName} />
                                    <AvatarFallback>
                                      {user.role === UserRole.STUDENT ? (
                                        <GraduationCap className="h-4 w-4" />
                                      ) : (
                                        user.displayName?.charAt(0) || user.email?.charAt(0)
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.displayName}</p>
                                    {user.studentId && (
                                      <p className="text-xs text-neutral-500">رقم: {user.studentId}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  user.role === UserRole.ADMIN
                                    ? "destructive"
                                    : user.role === UserRole.PROFESSOR
                                      ? "secondary"
                                      : "default"
                                }>
                                  {user.role === UserRole.STUDENT ? (
                                    <div className="flex items-center gap-1">
                                      <GraduationCap className="w-4 h-4" />
                                      {userRoleLabels[user.role]}
                                    </div>
                                  ) : (
                                    userRoleLabels[user.role]
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.department 
                                  ? departmentLabels[user.department] || user.department
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {user.createdAt ? format(
                                  typeof user.createdAt === 'string' 
                                    ? new Date(user.createdAt)
                                    : typeof user.createdAt.toDate === 'function'
                                      ? user.createdAt.toDate() 
                                      : new Date(),
                                  "d MMM yyyy",
                                  { locale: arEG }
                                ) : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-reverse space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openRoleDialog(user)}
                                  >
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => confirmDelete(user)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <p className="text-neutral-500">لا يوجد مستخدمين مطابقين لمعايير البحث</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? "جارٍ التحميل..." : "تحميل المزيد"}
                      </Button>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-2">
              <div className="flex items-center space-x-reverse space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.displayName} />
                  <AvatarFallback>{selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-neutral-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Change role dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير صلاحية المستخدم</DialogTitle>
            <DialogDescription>
              تغيير صلاحية المستخدم في النظام
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-2 space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.displayName} />
                  <AvatarFallback>{selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-neutral-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  الصلاحية الجديدة
                </label>
                <Select
                  value={newRole}
                  onValueChange={setNewRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="professor">دكتور</SelectItem>
                    <SelectItem value="admin">مسؤول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRoleDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={handleChangeRole}
              disabled={!newRole || newRole === selectedUser?.role}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Excel upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع ملف Excel للمستخدمين</DialogTitle>
            <DialogDescription>
              قم برفع ملف Excel يحتوي على بيانات المستخدمين لإنشاء حسابات جديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-md text-sm text-neutral-700">
              <p className="font-bold mb-2">معلومات هامة عن تنسيق الملف:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-green-700">✓ يدعم النظام نوعين من ملفات Excel:</h3>
                  <ol className="list-decimal list-inside mr-4 mt-1 space-y-1">
                    <li><span className="font-medium">ملف ايميلات الطلاب:</span> عمود واحد فقط يحتوي على بريد الطالب الجامعي</li>
                    <li><span className="font-medium">ملف بيانات كاملة:</span> يحتوي على أعمدة البيانات التفصيلية أدناه</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-amber-700">الأعمدة المطلوبة للملف التفصيلي:</h3>
                  <ul className="list-disc list-inside mr-4 mt-1 space-y-1">
                    <li><span className="font-medium">name:</span> الاسم الكامل للمستخدم</li>
                    <li><span className="font-medium">email:</span> البريد الإلكتروني</li>
                    <li><span className="font-medium">password:</span> كلمة المرور</li>
                    <li><span className="font-medium">role:</span> الصلاحية (student, professor, admin)</li>
                    <li><span className="font-medium">studentId:</span> (اختياري) الرقم الجامعي للطالب</li>
                    <li><span className="font-medium">department:</span> (اختياري) القسم</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById("excel-file")?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 ml-2" />
                اختر ملف Excel
              </Button>
              {excelFile && (
                <span className="text-sm text-neutral-600">
                  {excelFile.name}
                </span>
              )}
            </div>
            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setExcelFile(e.target.files[0]);
                }
              }}
              disabled={isUploading}
            />
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>النسبة المئوية: {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                  <span>المستخدم الحالي: {uploadProgress.current} من {uploadProgress.total}</span>
                </div>
                <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>العدد الكلي: {uploadProgress.total}</span>
                  <span className="text-green-600">نجح: {uploadProgress.success}</span>
                  <span className="text-red-600">فشل: {uploadProgress.failed}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={handleExcelUpload}
              disabled={!excelFile || isUploading}
            >
              {isUploading ? "جارٍ الرفع..." : "رفع الملف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
