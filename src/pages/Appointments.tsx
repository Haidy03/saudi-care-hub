import { useState, useMemo } from 'react';
import { Calendar, Plus, Edit, Trash2, Table, CalendarDays, Loader2, Search, Filter, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import AddPatientModal from '@/components/patients/AddPatientModal';
import { useAppointments, useCancelAppointment, useCreateAppointment, useUpdateAppointment, formatTimeForDisplay, formatTimeForDatabase, AppointmentWithDetails } from '@/hooks/useAppointments';
import { useCreatePatient } from '@/hooks/usePatients';

type ViewMode = 'table' | 'calendar';

const statusConfig = {
  upcoming: { label: 'قادم', className: 'bg-primary/10 text-primary' },
  completed: { label: 'مكتمل', className: 'bg-green-100 text-green-600' },
  cancelled: { label: 'ملغي', className: 'bg-destructive/10 text-destructive' },
};

export default function Appointments() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [clinicFilter, setClinicFilter] = useState<string>('all');

  const { data: appointments = [], isLoading, error } = useAppointments();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const createPatient = useCreatePatient();

  // Get unique doctors and clinics for filters
  const doctors = useMemo(() => {
    const uniqueDoctors = Array.from(
      new Map(
        appointments
          .filter(a => a.doctors?.name)
          .map(a => [a.doctor_id, { id: a.doctor_id, name: a.doctors!.name }])
      ).values()
    );
    return uniqueDoctors;
  }, [appointments]);

  const clinics = useMemo(() => {
    const uniqueClinics = Array.from(
      new Map(
        appointments
          .filter(a => a.clinics?.name)
          .map(a => [a.clinic_id, { id: a.clinic_id, name: a.clinics!.name }])
      ).values()
    );
    return uniqueClinics;
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.patients?.full_name?.toLowerCase().includes(query) ||
          appointment.doctors?.name?.toLowerCase().includes(query) ||
          appointment.clinics?.name?.toLowerCase().includes(query) ||
          appointment.reason?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((appointment) => new Date(appointment.appointment_date) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((appointment) => new Date(appointment.appointment_date) <= toDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }

    // Doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter((appointment) => appointment.doctor_id === doctorFilter);
    }

    // Clinic filter
    if (clinicFilter !== 'all') {
      filtered = filtered.filter((appointment) => appointment.clinic_id === clinicFilter);
    }

    return filtered;
  }, [searchQuery, appointments, dateFrom, dateTo, statusFilter, doctorFilter, clinicFilter]);

  // Statistics
  const totalAppointments = appointments.length;

  const todayAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime();
    }).length;
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter((appointment) => appointment.status === 'upcoming').length;
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter((appointment) => appointment.status === 'completed').length;
  }, [appointments]);

  const handleBookAppointment = async (data: any) => {
    try {
      if (data.id) {
        // Update existing appointment
        await updateAppointment.mutateAsync({
          id: data.id,
          patient_id: data.patientId,
          doctor_id: data.doctorId,
          clinic_id: data.clinicId,
          appointment_date: data.date,
          appointment_time: formatTimeForDatabase(data.time),
          appointment_type: data.appointmentType as 'general' | 'followup' | 'consultation' | 'emergency',
          reason: data.reason,
          notes: data.notes || null,
          send_reminder: data.sendReminder,
        });
        toast.success('تم تعديل الموعد بنجاح');
      } else {
        // Create new appointment
        await createAppointment.mutateAsync({
          patient_id: data.patientId,
          doctor_id: data.doctorId,
          clinic_id: data.clinicId,
          appointment_date: data.date,
          appointment_time: formatTimeForDatabase(data.time),
          appointment_type: data.appointmentType as 'general' | 'followup' | 'consultation' | 'emergency',
          reason: data.reason,
          notes: data.notes || null,
          send_reminder: data.sendReminder,
        });
        toast.success('تم حجز الموعد بنجاح');
      }
      setIsBookingModalOpen(false);
      setEditingAppointment(null);
    } catch (err) {
      toast.error(data.id ? 'حدث خطأ أثناء تعديل الموعد' : 'حدث خطأ أثناء حجز الموعد');
    }
  };

  const handleAddPatient = async (data: any) => {
    try {
      await createPatient.mutateAsync({
        full_name: data.fullName,
        gender: data.gender,
        birth_date: data.birthDate,
        national_id: data.nationalId,
        phone: data.phone,
        alt_phone: data.altPhone || null,
        email: data.email || null,
        address: data.address || null,
        blood_type: data.bloodType || null,
        chronic_diseases: data.chronicDiseases || null,
        allergies: data.allergies || null,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relation: data.emergencyContactRelation,
      });
      toast.success('تم إضافة المريض بنجاح');
      setIsPatientModalOpen(false);
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('رقم الهوية مسجل مسبقاً');
      } else {
        toast.error('حدث خطأ أثناء إضافة المريض');
      }
    }
  };

  const handleEdit = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setIsBookingModalOpen(true);
  };

  const handleDeleteClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await cancelAppointment.mutateAsync(selectedAppointment.id);
        toast.success(`تم إلغاء موعد: ${selectedAppointment.patients?.full_name}`);
      } catch (err) {
        toast.error('حدث خطأ أثناء إلغاء الموعد');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedAppointment(null);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المجموع الكلي</p>
              <h3 className="text-3xl font-bold text-foreground">{totalAppointments}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">مواعيد اليوم</p>
              <h3 className="text-3xl font-bold text-foreground">{todayAppointments}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المواعيد القادمة</p>
              <h3 className="text-3xl font-bold text-foreground">{upcomingAppointments}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المواعيد المكتملة</p>
              <h3 className="text-3xl font-bold text-foreground">{completedAppointments}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
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
                      : 'تاريخ الموعد'}
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
                        <SelectItem value="upcoming">قادم</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">الدكتور</label>
                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدكتور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
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
                          <SelectItem key={clinic.id} value={clinic.id}>
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
                        setDoctorFilter('all');
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

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsBookingModalOpen(true)}
              className="h-10 gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              حجز موعد جديد
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg w-fit">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('table')}
          className={`gap-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Table className="w-4 h-4" />
          عرض جدولي
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className={`gap-2 ${viewMode === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <CalendarDays className="w-4 h-4" />
          عرض تقويمي
        </Button>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">اسم المريض</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">العيادة</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">الدكتور</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">التاريخ</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">الوقت</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">الحالة</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      لا توجد مواعيد مسجلة
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      لا توجد نتائج مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const status = statusConfig[appointment.status as keyof typeof statusConfig];
                    return (
                      <tr
                        key={appointment.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        {/* Patient Name */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {appointment.patients?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">
                              {appointment.patients?.full_name || 'غير محدد'}
                            </span>
                          </div>
                        </td>

                        {/* Clinic */}
                        <td className="py-3 px-6 text-foreground">
                          {appointment.clinics?.name || 'غير محدد'}
                        </td>

                        {/* Doctor */}
                        <td className="py-3 px-6 text-foreground">
                          {appointment.doctors?.name || 'غير محدد'}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-6 text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                        </td>

                        {/* Time */}
                        <td className="py-3 px-6 text-foreground font-medium">
                          {formatTimeForDisplay(appointment.appointment_time)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status?.className || ''}`}>
                            {status?.label || appointment.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                              title="تعديل"
                            >
                              <Edit className="w-[18px] h-[18px]" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(appointment)}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                              title="إلغاء"
                              disabled={appointment.status === 'cancelled'}
                            >
                              <Trash2 className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              عرض {filteredAppointments.length} من {appointments.length} موعد
            </p>
          </div>
        </div>
      )}

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 flex flex-col items-center justify-center min-h-[400px]">
          <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">عرض التقويم</h3>
          <p className="text-muted-foreground text-center">
            سيتم إضافة عرض التقويم الشهري قريباً
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل تريد إلغاء هذا الموعد؟</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAppointment && (
                <>
                  موعد {selectedAppointment.patients?.full_name} مع {selectedAppointment.doctors?.name} بتاريخ {new Date(selectedAppointment.appointment_date).toLocaleDateString('ar-SA')} الساعة {formatTimeForDisplay(selectedAppointment.appointment_time)}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد الإلغاء'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleBookAppointment}
        onAddNewPatient={() => setIsPatientModalOpen(true)}
        editAppointment={editingAppointment ? {
          id: editingAppointment.id,
          patientId: editingAppointment.patient_id,
          patientName: editingAppointment.patients?.full_name || '',
          clinicId: editingAppointment.clinic_id,
          clinic: editingAppointment.clinics?.name || '',
          doctorId: editingAppointment.doctor_id,
          doctor: editingAppointment.doctors?.name || '',
          date: editingAppointment.appointment_date,
          time: formatTimeForDisplay(editingAppointment.appointment_time),
          appointmentType: editingAppointment.appointment_type,
          reason: editingAppointment.reason,
          notes: editingAppointment.notes || '',
          sendReminder: editingAppointment.send_reminder,
        } : null}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}
