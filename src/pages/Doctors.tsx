import { useState, useEffect, useMemo } from 'react';
import { Stethoscope, Plus, MoreVertical, Pencil, Trash2, Calendar, Loader2, Search, Filter, Users, TrendingUp } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import ViewDoctorScheduleModal from '@/components/doctors/ViewDoctorScheduleModal';
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor, useDoctorSchedule, DoctorWithClinic } from '@/hooks/useDoctors';
import { useClinics } from '@/hooks/useClinics';

const weekDays = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الإثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
];

export default function Doctors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorWithClinic | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorWithClinic | null>(null);
  const [editDoctorWithSchedule, setEditDoctorWithSchedule] = useState<any>(null);
  const [viewingScheduleDoctor, setViewingScheduleDoctor] = useState<DoctorWithClinic | null>(null);
  const [viewScheduleData, setViewScheduleData] = useState<any>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [clinicFilter, setClinicFilter] = useState<string>('all');

  const { toast } = useToast();

  const { data: doctors = [], isLoading, error } = useDoctors();
  const { data: clinics = [] } = useClinics();
  const { data: scheduleData } = useDoctorSchedule(editingDoctor?.id || '');
  const { data: viewScheduleDataFromDB } = useDoctorSchedule(viewingScheduleDoctor?.id || '');
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)));
    return uniqueSpecialties;
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    let filtered = doctors;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.phone.includes(query) ||
          (doctor.email && doctor.email.toLowerCase().includes(query)) ||
          (doctor.clinics?.name && doctor.clinics.name.toLowerCase().includes(query))
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((doctor) => new Date(doctor.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((doctor) => new Date(doctor.created_at) <= toDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.status === statusFilter);
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.specialty === specialtyFilter);
    }

    // Clinic filter
    if (clinicFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.clinics?.name === clinicFilter);
    }

    return filtered;
  }, [searchQuery, doctors, dateFrom, dateTo, statusFilter, specialtyFilter, clinicFilter]);

  // Statistics
  const totalDoctors = doctors.length;

  const todayDoctors = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return doctors.filter((doctor) => {
      const doctorDate = new Date(doctor.created_at);
      doctorDate.setHours(0, 0, 0, 0);
      return doctorDate.getTime() === today.getTime();
    }).length;
  }, [doctors]);

  const activeDoctors = useMemo(() => {
    return doctors.filter((doctor) => doctor.status === 'نشط').length;
  }, [doctors]);

  // Transform schedule data when loaded for editing
  useEffect(() => {
    if (editingDoctor && scheduleData) {
      const transformedSchedule = weekDays.map((weekDay) => {
        const dbSchedule = scheduleData.find(s => s.day_of_week === weekDay.key);
        return {
          day: weekDay.label,
          isWorking: dbSchedule?.is_working ?? (weekDay.key !== 'friday'),
          startTime: dbSchedule?.start_time || '08:00',
          endTime: dbSchedule?.end_time || '16:00',
        };
      });

      setEditDoctorWithSchedule({
        id: 0,
        name: editingDoctor.name,
        specialty: editingDoctor.specialty,
        clinic: editingDoctor.clinics?.name || '',
        phone: editingDoctor.phone,
        email: editingDoctor.email || '',
        experience: `${editingDoctor.experience_years} سنوات`,
        qualifications: editingDoctor.qualifications || '',
        bio: editingDoctor.bio || '',
        status: editingDoctor.status,
        iconColor: editingDoctor.icon_color || '',
        schedule: transformedSchedule,
      });
    } else if (!editingDoctor) {
      setEditDoctorWithSchedule(null);
    }
  }, [editingDoctor, scheduleData]);

  // Transform schedule data when loaded for viewing
  useEffect(() => {
    if (viewingScheduleDoctor && viewScheduleDataFromDB) {
      const transformedSchedule = weekDays.map((weekDay) => {
        const dbSchedule = viewScheduleDataFromDB.find(s => s.day_of_week === weekDay.key);
        return {
          day: weekDay.label,
          isWorking: dbSchedule?.is_working ?? (weekDay.key !== 'friday'),
          startTime: dbSchedule?.start_time || '08:00',
          endTime: dbSchedule?.end_time || '16:00',
        };
      });

      setViewScheduleData({
        name: viewingScheduleDoctor.name,
        specialty: viewingScheduleDoctor.specialty,
        schedule: transformedSchedule,
      });
    } else if (!viewingScheduleDoctor) {
      setViewScheduleData(null);
    }
  }, [viewingScheduleDoctor, viewScheduleDataFromDB]);

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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Doctors */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المجموع الكلي</p>
              <h3 className="text-3xl font-bold text-foreground">{totalDoctors}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Today's Doctors */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المضاف اليوم</p>
              <h3 className="text-3xl font-bold text-foreground">{todayDoctors}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Doctors */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الأطباء النشطون</p>
              <h3 className="text-3xl font-bold text-foreground">{activeDoctors}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-orange-600" />
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
                      : 'تاريخ الإضافة'}
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
                    <label className="text-sm font-medium mb-2 block">الحالة</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="في إجازة">في إجازة</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">التخصص</label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">العيادة</label>
                    <Select value={clinicFilter} onValueChange={setClinicFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العيادة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.name}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setStatusFilter('all');
                        setSpecialtyFilter('all');
                        setClinicFilter('all');
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

          {/* Right Section - Action Button */}
          <div className="flex items-center gap-2">
            <Button onClick={openAddModal} className="h-10 gap-2 bg-primary hover:bg-primary/90" disabled={createDoctor.isPending}>
              {createDoctor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              إضافة دكتور
            </Button>
          </div>
        </div>
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

      {/* No Results State */}
      {!isLoading && doctors.length > 0 && filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <p>لا توجد نتائج مطابقة للبحث</p>
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && filteredDoctors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
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
                      <DropdownMenuItem onClick={() => setViewingScheduleDoctor(doctor)}>
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

          {/* Results Footer */}
          <div className="bg-card rounded-lg shadow-sm border border-border px-6 py-4">
            <p className="text-sm text-muted-foreground">
              عرض {filteredDoctors.length} من {doctors.length} دكتور
            </p>
          </div>
        </>
      )}

      {/* Add/Edit Doctor Modal */}
      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDoctor(null);
          setEditDoctorWithSchedule(null);
        }}
        onSave={editingDoctor ? handleEditDoctor : handleAddDoctor}
        editDoctor={editDoctorWithSchedule}
        clinics={clinics}
      />

      {/* View Schedule Modal */}
      <ViewDoctorScheduleModal
        isOpen={!!viewingScheduleDoctor}
        onClose={() => setViewingScheduleDoctor(null)}
        doctor={viewScheduleData}
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
