import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AddPatientModal from '@/components/patients/AddPatientModal';

interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  registrationDate: string;
}

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const initialPatients: Patient[] = [
  { id: '1', name: 'محمد أحمد السالم', gender: 'male', age: 35, phone: '0551234567', registrationDate: '2025-01-04' },
  { id: '2', name: 'فاطمة علي العتيبي', gender: 'female', age: 28, phone: '0559876543', registrationDate: '2025-01-04' },
  { id: '3', name: 'عبدالله خالد المطيري', gender: 'male', age: 42, phone: '0555551234', registrationDate: '2025-01-03' },
  { id: '4', name: 'سارة محمد القحطاني', gender: 'female', age: 31, phone: '0558887777', registrationDate: '2025-01-03' },
  { id: '5', name: 'خالد عبدالرحمن الشمري', gender: 'male', age: 55, phone: '0554443333', registrationDate: '2025-01-02' },
  { id: '6', name: 'نورة سعود الدوسري', gender: 'female', age: 24, phone: '0557776666', registrationDate: '2025-01-02' },
  { id: '7', name: 'أحمد ناصر الغامدي', gender: 'male', age: 38, phone: '0552221111', registrationDate: '2025-01-01' },
];

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.phone.includes(query)
    );
  }, [searchQuery, patients]);

  const handleAddPatient = (formData: any) => {
    const newPatient: Patient = {
      id: String(patients.length + 1),
      name: formData.fullName,
      gender: formData.gender as 'male' | 'female',
      age: calculateAge(formData.birthDate),
      phone: formData.phone,
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPatient, ...prev]);
    setIsModalOpen(false);
    toast.success('تم إضافة المريض بنجاح');
  };

  const handleView = (patient: Patient) => {
    toast.info(`عرض بيانات: ${patient.name}`);
  };

  const handleEdit = (patient: Patient) => {
    toast.info(`تعديل بيانات: ${patient.name}`);
  };

  const handleDelete = (patient: Patient) => {
    toast.error(`حذف المريض: ${patient.name}`);
  };

  const handleFilter = () => {
    toast.info('سيتم فتح خيارات الفلترة');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المرضى</h1>
            <p className="text-sm text-muted-foreground">عرض وإدارة بيانات المرضى</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card border-border focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleFilter}
            className="gap-2 border-border hover:bg-muted"
          >
            <Filter className="w-4 h-4" />
            فلترة
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            إضافة مريض
          </Button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  الاسم الكامل
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  النوع
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  العمر
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  رقم الهاتف
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  تاريخ التسجيل
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-foreground sticky top-0 bg-muted/50">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    لا توجد نتائج مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{patient.name}</span>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          patient.gender === 'male'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-pink/10 text-pink'
                        }`}
                      >
                        {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-6 text-foreground">
                      {patient.age} سنة
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-6">
                      <span dir="ltr" className="text-foreground font-mono">
                        {patient.phone}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-6 text-muted-foreground">
                      {patient.registrationDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(patient)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="عرض"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {filteredPatients.length} من {patients.length} مريض
          </p>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}
