import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, Eye, Edit, Trash2, Loader2, Calendar, Download, Upload, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AddPatientModal from '@/components/patients/AddPatientModal';
import ViewPatientModal from '@/components/patients/ViewPatientModal';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient, calculateAge, type Patient } from '@/hooks/usePatients';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<{ id: string; name: string } | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState('');

  const { data: patients = [], isLoading, error } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(query) ||
          patient.phone.includes(query) ||
          patient.national_id.includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((patient) => new Date(patient.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter((patient) => new Date(patient.created_at) <= toDate);
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter((patient) => patient.gender === genderFilter);
    }

    // Age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter((patient) => {
        const age = calculateAge(patient.birth_date);
        switch (ageFilter) {
          case 'child': return age < 18;
          case 'adult': return age >= 18 && age < 60;
          case 'senior': return age >= 60;
          default: return true;
        }
      });
    }

    // Phone filter
    if (phoneFilter.trim()) {
      filtered = filtered.filter((patient) =>
        patient.phone.includes(phoneFilter.trim())
      );
    }

    return filtered;
  }, [searchQuery, patients, dateFrom, dateTo, genderFilter, ageFilter, phoneFilter]);

  // Statistics calculations
  const totalPatients = patients.length;

  const todayPatients = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return patients.filter((patient) => {
      const patientDate = new Date(patient.created_at);
      patientDate.setHours(0, 0, 0, 0);
      return patientDate.getTime() === today.getTime();
    }).length;
  }, [patients]);

  const weekPatients = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return patients.filter((patient) => new Date(patient.created_at) >= weekAgo).length;
  }, [patients]);

  const handleSavePatient = async (formData: any) => {
    try {
      const patientData = {
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
        marital_status: formData.maritalStatus || null,
        occupation: formData.occupation || null,
        nationality: formData.nationality || 'سعودي',
        insurance_provider: formData.insuranceProvider || null,
        insurance_number: formData.insuranceNumber || null,
        historical_medical_conditions: formData.historicalMedicalConditions || null,
        current_medications: formData.currentMedications || null,
        is_smoker: formData.isSmoker || false,
        has_insurance: formData.hasInsurance || false,
      };

      if (editingPatient) {
        await updatePatient.mutateAsync({ id: editingPatient.id, ...patientData });
        setEditingPatient(null);
        toast.success('تم تحديث بيانات المريض بنجاح');
      } else {
        await createPatient.mutateAsync(patientData);
        setIsModalOpen(false);
        toast.success('تم إضافة المريض بنجاح');
      }
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('رقم الهوية مسجل مسبقاً');
      } else {
        toast.error(editingPatient ? 'حدث خطأ أثناء تحديث المريض' : 'حدث خطأ أثناء إضافة المريض');
      }
    }
  };

  const handleView = (patient: Patient) => {
    setViewingPatient(patient);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Patients */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المجموع الكلي</p>
              <h3 className="text-3xl font-bold text-foreground">{totalPatients}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Today's Patients */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المضاف اليوم</p>
              <h3 className="text-3xl font-bold text-foreground">{todayPatients}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Weekly Patients */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المضاف هذا الأسبوع</p>
              <h3 className="text-3xl font-bold text-foreground">{weekPatients}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Left Section - Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-10 bg-background border-border"
              />
            </div>

            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 border-border">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {dateFrom || dateTo
                      ? `${dateFrom || '...'} - ${dateTo || '...'}`
                      : 'تاريخ الإنشاء'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">من تاريخ</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="flex-1"
                    >
                      إعادة تعيين
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Advanced Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 border-border">
                  <Filter className="w-4 h-4" />
                  فلترة متقدمة
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">النوع</label>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">العمر</label>
                    <Select value={ageFilter} onValueChange={setAgeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة العمرية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="child">أطفال (أقل من 18)</SelectItem>
                        <SelectItem value="adult">بالغون (18-60)</SelectItem>
                        <SelectItem value="senior">كبار السن (أكثر من 60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
                    <Input
                      type="text"
                      placeholder="ابحث برقم الهاتف..."
                      value={phoneFilter}
                      onChange={(e) => setPhoneFilter(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setGenderFilter('all');
                        setAgeFilter('all');
                        setPhoneFilter('');
                      }}
                      className="flex-1"
                    >
                      إعادة تعيين
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-border hover:bg-muted"
            >
              <Download className="w-4 h-4" />
              تحميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-border hover:bg-muted"
            >
              <Upload className="w-4 h-4" />
              رفع
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-10 gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              إضافة مريض
            </Button>
          </div>
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

      {/* Add/Edit Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen || !!editingPatient}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleSavePatient}
        editingPatient={editingPatient}
      />

      {/* View Patient Modal */}
      <ViewPatientModal
        isOpen={!!viewingPatient}
        onClose={() => setViewingPatient(null)}
        patient={viewingPatient}
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
