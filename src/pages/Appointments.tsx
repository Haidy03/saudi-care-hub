import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Table, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const { data: appointments = [], isLoading, error } = useAppointments();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const createPatient = useCreatePatient();

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
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-sm text-muted-foreground">جدولة ومتابعة المواعيد</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
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

        {/* New Appointment Button */}
        <Button
          onClick={() => setIsBookingModalOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          حجز موعد جديد
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
                ) : (
                  appointments.map((appointment) => {
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
              إجمالي المواعيد: {appointments.length}
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
