import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AddPatientModal from '@/components/patients/AddPatientModal';
import { usePatients, useCreatePatient, useDeletePatient, calculateAge } from '@/hooks/usePatients';
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

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<{ id: string; name: string } | null>(null);

  const { data: patients = [], isLoading, error } = usePatients();
  const createPatient = useCreatePatient();
  const deletePatient = useDeletePatient();

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.full_name.toLowerCase().includes(query) ||
        patient.phone.includes(query)
    );
  }, [searchQuery, patients]);

  const handleAddPatient = async (formData: any) => {
    try {
      await createPatient.mutateAsync({
        full_name: formData.fullName,
        gender: formData.gender,
        birth_date: formData.birthDate,
        national_id: formData.nationalId,
        phone: formData.phone,
        alt_phone: formData.altPhone || null,
        email: formData.email || null,
        address: formData.address || null,
        blood_type: formData.bloodType || null,
        chronic_diseases: formData.chronicDiseases || null,
        allergies: formData.allergies || null,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relation: formData.emergencyContactRelation,
      });
      setIsModalOpen(false);
      toast.success('تم إضافة المريض بنجاح');
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('رقم الهوية مسجل مسبقاً');
      } else {
        toast.error('حدث خطأ أثناء إضافة المريض');
      }
    }
  };

  const handleView = (patient: any) => {
    toast.info(`عرض بيانات: ${patient.full_name}`);
  };

  const handleEdit = (patient: any) => {
    toast.info(`تعديل بيانات: ${patient.full_name}`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return;
    try {
      await deletePatient.mutateAsync(deletingPatient.id);
      toast.success('تم حذف المريض بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء حذف المريض');
    }
    setDeletingPatient(null);
  };

  const handleFilter = () => {
    toast.info('سيتم فتح خيارات الفلترة');
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المرضى</h1>
            <p className="text-sm text-muted-foreground">عرض وإدارة بيانات المرضى</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card border-border focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleFilter}
            className="gap-2 border-border hover:bg-muted"
          >
            <Filter className="w-4 h-4" />
            فلترة
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            إضافة مريض
          </Button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  الاسم الكامل
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  النوع
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  العمر
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  رقم الهاتف
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  تاريخ التسجيل
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    {searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مرضى مسجلين'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {patient.full_name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{patient.full_name}</span>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          patient.gender === 'male'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-pink-100 text-pink-600'
                        }`}
                      >
                        {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-6 text-foreground">
                      {calculateAge(patient.birth_date)} سنة
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-6">
                      <span dir="ltr" className="text-foreground font-mono">
                        {patient.phone}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-6 text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString('ar-SA')}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(patient)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="عرض"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => setDeletingPatient({ id: patient.id, name: patient.full_name })}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {filteredPatients.length} من {patients.length} مريض
          </p>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPatient}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المريض "{deletingPatient?.name}"؟ سيتم حذف جميع المواعيد المرتبطة بهذا المريض.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deletePatient.isPending}
            >
              {deletePatient.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
