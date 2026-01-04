import { Stethoscope, Plus, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const doctors = [
  { 
    id: '١', 
    name: 'د. سارة الخالد', 
    specialty: 'طب عام', 
    phone: '٠٥٥١٢٣٤٥٦٧',
    available: true,
    patients: '١٢٠',
    experience: '٨ سنوات'
  },
  { 
    id: '٢', 
    name: 'د. خالد السعود', 
    specialty: 'أمراض القلب', 
    phone: '٠٥٠٩٨٧٦٥٤٣',
    available: true,
    patients: '٨٥',
    experience: '١٢ سنة'
  },
  { 
    id: '٣', 
    name: 'د. نورة الأحمد', 
    specialty: 'طب الأطفال', 
    phone: '٠٥٤٣٢١٦٥٤٩',
    available: false,
    patients: '١٥٠',
    experience: '١٠ سنوات'
  },
  { 
    id: '٤', 
    name: 'د. عبدالرحمن المالكي', 
    specialty: 'جلدية', 
    phone: '٠٥٦٧٨٩٠١٢٣',
    available: true,
    patients: '٩٥',
    experience: '٦ سنوات'
  },
  { 
    id: '٥', 
    name: 'د. منى الحربي', 
    specialty: 'عظام', 
    phone: '٠٥٢٣٤٥٦٧٨٩',
    available: true,
    patients: '٧٥',
    experience: '٩ سنوات'
  },
  { 
    id: '٦', 
    name: 'د. فهد القحطاني', 
    specialty: 'باطنية', 
    phone: '٠٥٨٧٦٥٤٣٢١',
    available: false,
    patients: '١١٠',
    experience: '١٥ سنة'
  },
];

export default function Doctors() {
  const availableCount = doctors.filter(d => d.available).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الأطباء</h1>
            <p className="text-muted-foreground">{availableCount} من {doctors.length} أطباء متاحين</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة طبيب
        </Button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="border-border/50 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.available 
                    ? 'bg-success/10 text-success' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {doctor.available ? 'متاح' : 'غير متاح'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>الخبرة: {doctor.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{doctor.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المرضى</span>
                  <span className="font-medium text-foreground">{doctor.patients} مريض</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  اتصال
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  رسالة
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
