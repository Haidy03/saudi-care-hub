import { Users, Calendar, Stethoscope, Building2, TrendingUp } from 'lucide-react';

const kpiCards = [
  {
    title: 'إجمالي المرضى',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    iconBg: 'bg-primary',
  },
  {
    title: 'مواعيد اليوم',
    value: '45',
    change: '+5%',
    changeType: 'positive',
    icon: Calendar,
    iconBg: 'bg-success',
  },
  {
    title: 'الأطباء',
    value: '28',
    change: '+2%',
    changeType: 'positive',
    icon: Stethoscope,
    iconBg: 'bg-purple',
  },
  {
    title: 'العيادات',
    value: '12',
    change: '0%',
    changeType: 'neutral',
    icon: Building2,
    iconBg: 'bg-warning',
  },
];

const weeklyAppointments = [
  { day: 'السبت', height: 60 },
  { day: 'الأحد', height: 75 },
  { day: 'الإثنين', height: 85 },
  { day: 'الثلاثاء', height: 70 },
  { day: 'الأربعاء', height: 90 },
  { day: 'الخميس', height: 65 },
  { day: 'الجمعة', height: 40 },
];

const recentActivities = [
  {
    id: 1,
    dotColor: 'bg-success',
    icon: Users,
    title: 'محمد أحمد السالم',
    subtitle: 'تم تسجيل مريض جديد',
    time: 'منذ ساعة',
  },
  {
    id: 2,
    dotColor: 'bg-primary',
    icon: Calendar,
    title: 'موعد مع د. سارة الأحمد',
    subtitle: 'عيادة الأسنان - غداً الساعة 10:00 ص',
    time: 'منذ ساعتين',
  },
  {
    id: 3,
    dotColor: 'bg-success',
    icon: Users,
    title: 'فاطمة علي العتيبي',
    subtitle: 'تم تسجيل مريض جديد',
    time: 'منذ 3 ساعات',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">نظرة عامة على أداء المركز</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.changeType === 'positive' && (
                    <TrendingUp className="w-4 h-4 text-success" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gender Distribution Chart */}
        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-bold text-foreground mb-6">توزيع المرضى حسب النوع</h3>
          <div className="flex items-center justify-center gap-8">
            {/* Male Circle */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-white">58%</span>
              </div>
              <span className="text-sm font-medium text-foreground">ذكور (716)</span>
            </div>
            {/* Female Circle */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-pink flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-white">42%</span>
              </div>
              <span className="text-sm font-medium text-foreground">إناث (518)</span>
            </div>
          </div>
        </div>

        {/* Weekly Appointments Bar Chart */}
        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-bold text-foreground mb-6">المواعيد الأسبوعية</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyAppointments.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary hover:bg-primary/80 transition-colors duration-200 rounded-t-md cursor-pointer"
                  style={{ height: `${item.height}%` }}
                />
                <span className="text-xs text-muted-foreground mt-2 whitespace-nowrap">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">آخر الأنشطة</h3>
        <div className="space-y-1">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Dot Indicator */}
                <div className={`w-2.5 h-2.5 rounded-full ${activity.dotColor}`} />
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                {/* Text Content */}
                <div>
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                </div>
              </div>
              {/* Time */}
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
