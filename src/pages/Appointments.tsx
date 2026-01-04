import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Table, CalendarDays } from 'lucide-react';
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

type ViewMode = 'table' | 'calendar';
type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  patientName: string;
  clinic: string;
  doctor: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

const appointmentsData: Appointment[] = [
  { id: '1', patientName: 'أحمد عبدالله', clinic: 'عيادة الأسنان', doctor: 'د. سارة الأحمد', date: '2025-01-05', time: '10:00 ص', status: 'upcoming' },
  { id: '2', patientName: 'نورة سعد', clinic: 'عيادة العظام', doctor: 'د. محمد العمري', date: '2025-01-05', time: '11:30 ص', status: 'upcoming' },
  { id: '3', patientName: 'خالد فهد', clinic: 'عيادة الجلدية', doctor: 'د. ليلى الشهري', date: '2025-01-05', time: '02:00 م', status: 'upcoming' },
  { id: '4', patientName: 'ريم أحمد', clinic: 'عيادة الأطفال', doctor: 'د. عمر الزهراني', date: '2025-01-04', time: '09:00 ص', status: 'completed' },
  { id: '5', patientName: 'سلطان محمد', clinic: 'عيادة الباطنة', doctor: 'د. هند العتيبي', date: '2025-01-04', time: '03:00 م', status: 'cancelled' },
  { id: '6', patientName: 'لمى عبدالرحمن', clinic: 'عيادة العيون', doctor: 'د. فيصل الدوسري', date: '2025-01-04', time: '04:30 م', status: 'completed' },
  { id: '7', patientName: 'فهد سالم', clinic: 'عيادة الأسنان', doctor: 'د. سارة الأحمد', date: '2025-01-03', time: '10:30 ص', status: 'completed' },
  { id: '8', patientName: 'منى خالد', clinic: 'عيادة النساء', doctor: 'د. نوف القحطاني', date: '2025-01-03', time: '01:00 م', status: 'cancelled' },
];

const statusConfig = {
  upcoming: { label: 'قادم', className: 'bg-primary/10 text-primary' },
  completed: { label: 'مكتمل', className: 'bg-success/10 text-success' },
  cancelled: { label: 'ملغي', className: 'bg-destructive/10 text-destructive' },
};

export default function Appointments() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleNewAppointment = () => {
    toast.info('سيتم فتح نموذج حجز موعد');
  };

  const handleEdit = (appointment: Appointment) => {
    toast.info(`تعديل موعد: ${appointment.patientName} - ${appointment.clinic} - ${appointment.date} ${appointment.time}`);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAppointment) {
      toast.success(`تم إلغاء موعد: ${selectedAppointment.patientName}`);
    }
    setDeleteDialogOpen(false);
    setSelectedAppointment(null);
  };

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
        <Button onClick={handleNewAppointment} className="gap-2 bg-primary hover:bg-primary/90">
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
                {appointmentsData.map((appointment) => {
                  const status = statusConfig[appointment.status];
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
                              {appointment.patientName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{appointment.patientName}</span>
                        </div>
                      </td>

                      {/* Clinic */}
                      <td className="py-3 px-6 text-foreground">{appointment.clinic}</td>

                      {/* Doctor */}
                      <td className="py-3 px-6 text-foreground">{appointment.doctor}</td>

                      {/* Date */}
                      <td className="py-3 px-6 text-muted-foreground">{appointment.date}</td>

                      {/* Time */}
                      <td className="py-3 px-6 text-foreground font-medium">{appointment.time}</td>

                      {/* Status */}
                      <td className="py-3 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(appointment)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="إلغاء"
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              إجمالي المواعيد: {appointmentsData.length}
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
                  موعد {selectedAppointment.patientName} مع {selectedAppointment.doctor} بتاريخ {selectedAppointment.date} الساعة {selectedAppointment.time}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
