import { Stethoscope, Plus, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const doctors = [
  { 
    id: 1, 
    name: 'د. سارة الأحمد', 
    specialty: 'طب الأسنان',
    clinic: 'عيادة الأسنان',
    phone: '0551111111',
    experience: '8 سنوات',
    status: 'نشط',
    iconColor: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 2, 
    name: 'د. محمد العمري', 
    specialty: 'طب العظام',
    clinic: 'عيادة العظام',
    phone: '0552222222',
    experience: '12 سنوات',
    status: 'نشط',
    iconColor: 'bg-green-100 text-green-600'
  },
  { 
    id: 3, 
    name: 'د. ليلى الشهري', 
    specialty: 'طب الجلدية',
    clinic: 'عيادة الجلدية',
    phone: '0553333333',
    experience: '10 سنوات',
    status: 'نشط',
    iconColor: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 4, 
    name: 'د. عمر الزهراني', 
    specialty: 'طب الأطفال',
    clinic: 'عيادة الأطفال',
    phone: '0554444444',
    experience: '6 سنوات',
    status: 'نشط',
    iconColor: 'bg-orange-100 text-orange-600'
  },
  { 
    id: 5, 
    name: 'د. هند العتيبي', 
    specialty: 'الباطنة',
    clinic: 'عيادة الباطنة',
    phone: '0555555555',
    experience: '15 سنوات',
    status: 'نشط',
    iconColor: 'bg-pink-100 text-pink-600'
  },
  { 
    id: 6, 
    name: 'د. فهد الشمري', 
    specialty: 'الجراحة العامة',
    clinic: 'عيادة الجراحة',
    phone: '0556666666',
    experience: '18 سنوات',
    status: 'في إجازة',
    iconColor: 'bg-red-100 text-red-600'
  },
];

export default function Doctors() {
  const handleAddDoctor = () => {
    alert('سيتم فتح نموذج إضافة دكتور');
  };

  const handleMenuClick = (doctorName: string) => {
    alert(`قائمة الخيارات: تعديل، عرض الجدول، تعطيل\nالدكتور: ${doctorName}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الأطباء</h1>
          <p className="text-sm text-muted-foreground">إدارة الأطباء والتخصصات</p>
        </div>
        <Button onClick={handleAddDoctor} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة دكتور
        </Button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="relative bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              {/* Menu Button */}
              <button
                onClick={() => handleMenuClick(doctor.name)}
                className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Doctor Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${doctor.iconColor}`}>
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
                  <span className="font-medium text-foreground">{doctor.clinic}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span className="font-medium text-foreground" dir="ltr">{doctor.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">سنوات الخبرة:</span>
                  <span className="font-medium text-foreground">{doctor.experience}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.status === 'نشط' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doctor.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
