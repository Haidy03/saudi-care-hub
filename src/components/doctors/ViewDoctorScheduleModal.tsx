import { Calendar, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface WorkingDay {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

interface Doctor {
  name: string;
  specialty: string;
  schedule?: WorkingDay[];
}

interface ViewDoctorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

export default function ViewDoctorScheduleModal({
  isOpen,
  onClose,
  doctor,
}: ViewDoctorScheduleModalProps) {
  if (!doctor) return null;

  const workingDays = doctor.schedule?.filter(day => day.isWorking) || [];
  const nonWorkingDays = doctor.schedule?.filter(day => !day.isWorking) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                جدول العمل الأسبوعي
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {doctor.name} - {doctor.specialty}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Working Days Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              أيام العمل
            </h3>

            {workingDays.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        اليوم
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        من
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        إلى
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        المدة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workingDays.map((day, index) => {
                      const start = day.startTime.split(':');
                      const end = day.endTime.split(':');
                      const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
                      const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
                      const durationHours = Math.floor((endMinutes - startMinutes) / 60);
                      const durationMinutes = (endMinutes - startMinutes) % 60;

                      return (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{day.day}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono" dir="ltr">
                              {day.startTime}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono" dir="ltr">
                              {day.endTime}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {durationHours > 0 && `${durationHours} ساعة`}
                              {durationMinutes > 0 && ` ${durationMinutes} دقيقة`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                لا توجد أيام عمل محددة
              </p>
            )}
          </div>

          {/* Non-Working Days Section */}
          {nonWorkingDays.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">أيام العطلة</h3>
              <div className="flex flex-wrap gap-2">
                {nonWorkingDays.map((day, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                  >
                    {day.day}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">إجمالي أيام العمل</p>
                <p className="text-2xl font-bold text-foreground">
                  {workingDays.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">إجمالي أيام العطلة</p>
                <p className="text-2xl font-bold text-foreground">
                  {nonWorkingDays.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
