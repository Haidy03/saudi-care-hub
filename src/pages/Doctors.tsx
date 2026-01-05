import { useState } from 'react';
import { Stethoscope, Plus, MoreVertical, Pencil, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  experience: string;
  status: string;
  iconColor: string;
}

const iconColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
  'bg-red-100 text-red-600',
  'bg-cyan-100 text-cyan-600',
  'bg-amber-100 text-amber-600',
];

const initialDoctors: Doctor[] = [
  { 
    id: 1, 
    name: 'د. سارة الأحمد', 
    specialty: 'طب الأسنان',
    clinic: 'عيادة الأسنان',
    phone: '0551111111',
    experience: '8 سنوات',
    status: 'نشط',
    iconColor: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 2, 
    name: 'د. محمد العمري', 
    specialty: 'طب العظام',
    clinic: 'عيادة العظام',
    phone: '0552222222',
    experience: '12 سنوات',
    status: 'نشط',
    iconColor: 'bg-green-100 text-green-600'
  },
  { 
    id: 3, 
    name: 'د. ليلى الشهري', 
    specialty: 'طب الجلدية',
    clinic: 'عيادة الجلدية',
    phone: '0553333333',
    experience: '10 سنوات',
    status: 'نشط',
    iconColor: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 4, 
    name: 'د. عمر الزهراني', 
    specialty: 'طب الأطفال',
    clinic: 'عيادة الأطفال',
    phone: '0554444444',
    experience: '6 سنوات',
    status: 'نشط',
    iconColor: 'bg-orange-100 text-orange-600'
  },
  { 
    id: 5, 
    name: 'د. هند العتيبي', 
    specialty: 'الباطنة',
    clinic: 'عيادة الباطنة',
    phone: '0555555555',
    experience: '15 سنوات',
    status: 'نشط',
    iconColor: 'bg-pink-100 text-pink-600'
  },
  { 
    id: 6, 
    name: 'د. فهد الشمري', 
    specialty: 'الجراحة العامة',
    clinic: 'عيادة الجراحة',
    phone: '0556666666',
    experience: '18 سنوات',
    status: 'في إجازة',
    iconColor: 'bg-red-100 text-red-600'
  },
];

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const { toast } = useToast();

  const handleAddDoctor = (doctorData: Omit<Doctor, 'id' | 'iconColor'>) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: Math.max(...doctors.map(d => d.id), 0) + 1,
      iconColor: iconColors[doctors.length % iconColors.length],
    };
    setDoctors([...doctors, newDoctor]);
    setIsModalOpen(false);
    setEditingDoctor(null);
    toast({
      title: 'تم بنجاح',
      description: editingDoctor ? 'تم تعديل بيانات الدكتور بنجاح' : 'تم إضافة الدكتور بنجاح',
    });
  };

  const handleEditDoctor = (doctorData: Omit<Doctor, 'id' | 'iconColor'>) => {
    if (!editingDoctor) return;
    setDoctors(doctors.map(d => 
      d.id === editingDoctor.id 
        ? { ...d, ...doctorData }
        : d
    ));
    setIsModalOpen(false);
    setEditingDoctor(null);
    toast({
      title: 'تم بنجاح',
      description: 'تم تعديل بيانات الدكتور بنجاح',
    });
  };

  const handleDeleteDoctor = () => {
    if (!deletingDoctor) return;
    setDoctors(doctors.filter(d => d.id !== deletingDoctor.id));
    setDeletingDoctor(null);
    toast({
      title: 'تم الحذف',
      description: 'تم حذف الدكتور بنجاح',
    });
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الأطباء</h1>
          <p className="text-sm text-muted-foreground">إدارة الأطباء والتخصصات</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة دكتور
        </Button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="relative bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              {/* Menu Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => openEditModal(doctor)}>
                    <Pencil className="w-4 h-4 ml-2" />
                    تعديل البيانات
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 ml-2" />
                    عرض الجدول
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeletingDoctor(doctor)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Doctor Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${doctor.iconColor}`}>
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">العيادة:</span>
                  <span className="font-medium text-foreground">{doctor.clinic}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span className="font-medium text-foreground" dir="ltr">{doctor.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">سنوات الخبرة:</span>
                  <span className="font-medium text-foreground">{doctor.experience}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.status === 'نشط' 
                      ? 'bg-green-100 text-green-700' 
                      : doctor.status === 'في إجازة'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {doctor.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Doctor Modal */}
      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDoctor(null);
        }}
        onSave={editingDoctor ? handleEditDoctor : handleAddDoctor}
        editDoctor={editingDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDoctor} onOpenChange={() => setDeletingDoctor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الدكتور "{deletingDoctor?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoctor} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
