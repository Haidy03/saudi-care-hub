import { Building2, Users, Calendar, Stethoscope, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'إجمالي المرضى',
    value: '٢,٤٥٦',
    change: '+١٢٪',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'المواعيد اليوم',
    value: '٤٨',
    change: '+٥٪',
    icon: Calendar,
    trend: 'up',
  },
  {
    title: 'الأطباء المتاحين',
    value: '١٢',
    change: '٠٪',
    icon: Stethoscope,
    trend: 'neutral',
  },
  {
    title: 'نسبة الحضور',
    value: '٩٤٪',
    change: '+٣٪',
    icon: TrendingUp,
    trend: 'up',
  },
];

const recentAppointments = [
  { patient: 'أحمد محمد العلي', doctor: 'د. سارة الخالد', time: '٩:٠٠ ص', status: 'مؤكد' },
  { patient: 'فاطمة عبدالله', doctor: 'د. خالد السعود', time: '٩:٣٠ ص', status: 'في الانتظار' },
  { patient: 'محمد إبراهيم', doctor: 'د. نورة الأحمد', time: '١٠:٠٠ ص', status: 'مؤكد' },
  { patient: 'سلمى العتيبي', doctor: 'د. عبدالرحمن المالكي', time: '١٠:٣٠ ص', status: 'مؤكد' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة المركز الصحي</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {stat.change} من الشهر الماضي
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            المواعيد القادمة
          </CardTitle>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            عرض الكل
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments.map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{appointment.time}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'مؤكد' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
