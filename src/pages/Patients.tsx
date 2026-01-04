import { Users, Search, Plus, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const patients = [
  { id: '١', name: 'أحمد محمد العلي', nationalId: '١٠٨٥٧٤٣٢١٠', phone: '٠٥٥١٢٣٤٥٦٧', age: '٣٥', gender: 'ذكر' },
  { id: '٢', name: 'فاطمة عبدالله الشمري', nationalId: '١٠٩٨٧٦٥٤٣٢', phone: '٠٥٠٩٨٧٦٥٤٣', age: '٢٨', gender: 'أنثى' },
  { id: '٣', name: 'محمد إبراهيم السعيد', nationalId: '١٠٧٦٥٤٣٢١٩', phone: '٠٥٤٣٢١٦٥٤٩', age: '٤٥', gender: 'ذكر' },
  { id: '٤', name: 'نورة خالد العتيبي', nationalId: '١٠٦٥٤٣٢١٠٨', phone: '٠٥٦٧٨٩٠١٢٣', age: '٣٢', gender: 'أنثى' },
  { id: '٥', name: 'عبدالرحمن سعود المالكي', nationalId: '١٠٥٤٣٢١٠٩٧', phone: '٠٥٢٣٤٥٦٧٨٩', age: '٥٢', gender: 'ذكر' },
];

export default function Patients() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">المرضى</h1>
            <p className="text-muted-foreground">إدارة سجلات المرضى</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مريض
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="البحث عن مريض بالاسم أو رقم الهوية..."
              className="pr-10 bg-muted/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">قائمة المرضى ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المريض</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الهوية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الجوال</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">العمر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الجنس</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 text-sm text-muted-foreground">{patient.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{patient.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground font-mono">{patient.nationalId}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{patient.phone}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{patient.age} سنة</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.gender === 'ذكر' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
