import { useState } from 'react';
import { Stethoscope, Plus, MoreVertical, Pencil, Trash2, Calendar, Loader2 } from 'lucide-react';
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
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor, DoctorWithClinic } from '@/hooks/useDoctors';
import { useClinics } from '@/hooks/useClinics';

export default function Doctors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorWithClinic | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorWithClinic | null>(null);
  const { toast } = useToast();

  const { data: doctors = [], isLoading, error } = useDoctors();
  const { data: clinics = [] } = useClinics();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const handleAddDoctor = async (doctorData: any) => {
    const clinicId = clinics.find(c => c.name === doctorData.clinic)?.id;
    
    try {
      await createDoctor.mutateAsync({
        doctor: {
          name: doctorData.name,
          specialty: doctorData.specialty,
          clinic_id: clinicId || null,
          phone: doctorData.phone,
          email: doctorData.email || null,
          experience_years: parseInt(doctorData.experience.replace(/[^0-9]/g, '')) || 0,
          qualifications: doctorData.qualifications || null,
          bio: doctorData.bio || null,
          status: doctorData.status,
        },
        schedule: doctorData.schedule?.map((s: any) => ({
          day_of_week: s.dayKey,
          is_working: s.isWorking,
          start_time: s.startTime,
          end_time: s.endTime,
        })),
      });
      setIsModalOpen(false);
      setEditingDoctor(null);
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الدكتور بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة الدكتور',
        variant: 'destructive',
      });
    }
  };

  const handleEditDoctor = async (doctorData: any) => {
    if (!editingDoctor) return;
    
    const clinicId = clinics.find(c => c.name === doctorData.clinic)?.id;
    
    try {
      await updateDoctor.mutateAsync({
        id: editingDoctor.id,
        doctor: {
          name: doctorData.name,
          specialty: doctorData.specialty,
          clinic_id: clinicId || null,
          phone: doctorData.phone,
          email: doctorData.email || null,
          experience_years: parseInt(doctorData.experience.replace(/[^0-9]/g, '')) || 0,
          qualifications: doctorData.qualifications || null,
          bio: doctorData.bio || null,
          status: doctorData.status,
        },
        schedule: doctorData.schedule?.map((s: any) => ({
          day_of_week: s.dayKey,
          is_working: s.isWorking,
          start_time: s.startTime,
          end_time: s.endTime,
        })),
      });
      setIsModalOpen(false);
      setEditingDoctor(null);
      toast({
        title: 'تم بنجاح',
        description: 'تم تعديل بيانات الدكتور بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تعديل البيانات',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;
    
    try {
      await deleteDoctor.mutateAsync(deletingDoctor.id);
      setDeletingDoctor(null);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الدكتور بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الدكتور',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (doctor: DoctorWithClinic) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الأطباء</h1>
          <p className="text-sm text-muted-foreground">إدارة الأطباء والتخصصات</p>
        </div>
        <Button onClick={openAddModal} className="gap-2" disabled={createDoctor.isPending}>
          {createDoctor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          إضافة دكتور
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && doctors.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Stethoscope className="w-12 h-12 mb-4 opacity-50" />
          <p>لا يوجد أطباء مسجلين</p>
          <Button onClick={openAddModal} variant="outline" className="mt-4">
            إضافة أول دكتور
          </Button>
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && doctors.length > 0 && (
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${doctor.icon_color || 'bg-blue-100 text-blue-600'}`}>
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
                    <span className="font-medium text-foreground">{doctor.clinics?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="font-medium text-foreground" dir="ltr">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">سنوات الخبرة:</span>
                    <span className="font-medium text-foreground">
                      {doctor.experience_years} {doctor.experience_years === 1 ? 'سنة' : 'سنوات'}
                    </span>
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
      )}

      {/* Add/Edit Doctor Modal */}
      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDoctor(null);
        }}
        onSave={editingDoctor ? handleEditDoctor : handleAddDoctor}
        editDoctor={editingDoctor ? {
          id: 0,
          name: editingDoctor.name,
          specialty: editingDoctor.specialty,
          clinic: editingDoctor.clinics?.name || '',
          phone: editingDoctor.phone,
          experience: `${editingDoctor.experience_years} سنوات`,
          status: editingDoctor.status,
          iconColor: editingDoctor.icon_color || '',
        } : null}
        clinics={clinics}
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
            <AlertDialogAction 
              onClick={handleDeleteDoctor} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteDoctor.isPending}
            >
              {deleteDoctor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
