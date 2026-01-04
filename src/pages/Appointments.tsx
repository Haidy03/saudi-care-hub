import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const appointments = [
  { 
    id: '١', 
    patient: 'أحمد محمد العلي', 
    doctor: 'د. سارة الخالد', 
    specialty: 'طب عام',
    date: '٢٠٢٤/٠١/١٥', 
    time: '٩:٠٠ ص', 
    status: 'scheduled' 
  },
  { 
    id: '٢', 
    patient: 'فاطمة عبدالله', 
    doctor: 'د. خالد السعود', 
    specialty: 'أمراض القلب',
    date: '٢٠٢٤/٠١/١٥', 
    time: '٩:٣٠ ص', 
    status: 'completed' 
  },
  { 
    id: '٣', 
    patient: 'محمد إبراهيم', 
    doctor: 'د. نورة الأحمد', 
    specialty: 'طب الأطفال',
    date: '٢٠٢٤/٠١/١٥', 
    time: '١٠:٠٠ ص', 
    status: 'scheduled' 
  },
  { 
    id: '٤', 
    patient: 'سلمى العتيبي', 
    doctor: 'د. عبدالرحمن المالكي', 
    specialty: 'جلدية',
    date: '٢٠٢٤/٠١/١٥', 
    time: '١٠:٣٠ ص', 
    status: 'cancelled' 
  },
  { 
    id: '٥', 
    patient: 'خالد الدوسري', 
    doctor: 'د. منى الحربي', 
    specialty: 'عظام',
    date: '٢٠٢٤/٠١/١٥', 
    time: '١١:٠٠ ص', 
    status: 'scheduled' 
  },
];

const statusConfig = {
  scheduled: { label: 'مجدول', icon: Clock, className: 'bg-primary/10 text-primary' },
  completed: { label: 'مكتمل', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  cancelled: { label: 'ملغي', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function Appointments() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">المواعيد</h1>
            <p className="text-muted-foreground">إدارة مواعيد المرضى</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          حجز موعد
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">٣</p>
              <p className="text-sm text-muted-foreground">مواعيد مجدولة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">١</p>
              <p className="text-sm text-muted-foreground">مواعيد مكتملة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">١</p>
              <p className="text-sm text-muted-foreground">مواعيد ملغية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">مواعيد اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const status = statusConfig[appointment.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctor} • {appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="font-medium text-foreground">{appointment.time}</p>
                      <p className="text-sm text-muted-foreground">{appointment.date}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
