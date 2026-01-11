import { useState, useEffect } from 'react';
import { X, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkingDay {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

interface DoctorFormData {
  fullName: string;
  specialty: string;
  clinic: string;
  phone: string;
  email: string;
  experience: string;
  qualifications: string;
  status: string;
  bio: string;
  schedule: WorkingDay[];
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  email?: string;
  experience: string;
  qualifications?: string;
  bio?: string;
  status: string;
  iconColor: string;
  schedule?: WorkingDay[];
}

interface ClinicOption {
  id: string;
  name: string;
}

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctor: Omit<Doctor, 'id' | 'iconColor'> & { schedule?: any[] }) => void;
  editDoctor?: Doctor | null;
  clinics?: ClinicOption[];
}

const defaultClinics = [
  'عيادة الأسنان',
  'عيادة العظام',
  'عيادة الجلدية',
  'عيادة الأطفال',
  'عيادة الباطنة',
  'عيادة الجراحة',
];

const specialties = [
  'طب الأسنان',
  'طب العظام',
  'طب الجلدية',
  'طب الأطفال',
  'الباطنة',
  'الجراحة العامة',
  'طب العيون',
  'طب الأنف والأذن والحنجرة',
  'طب القلب',
  'طب الأعصاب',
];

const weekDays = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الإثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
];

const initialSchedule: WorkingDay[] = weekDays.map((day) => ({
  day: day.label,
  isWorking: day.key !== 'friday',
  startTime: '08:00',
  endTime: '16:00',
}));

const initialFormData: DoctorFormData = {
  fullName: '',
  specialty: '',
  clinic: '',
  phone: '',
  email: '',
  experience: '',
  qualifications: '',
  status: 'نشط',
  bio: '',
  schedule: initialSchedule,
};

export default function AddDoctorModal({ isOpen, onClose, onSave, editDoctor, clinics }: AddDoctorModalProps) {
  const clinicOptions = clinics?.map(c => c.name) || defaultClinics;
  const [formData, setFormData] = useState<DoctorFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'schedule'>('info');

  useEffect(() => {
    if (editDoctor) {
      setFormData({
        fullName: editDoctor.name,
        specialty: editDoctor.specialty,
        clinic: editDoctor.clinic,
        phone: editDoctor.phone,
        email: editDoctor.email || '',
        experience: editDoctor.experience.replace(' سنوات', '').replace(' سنة', ''),
        qualifications: editDoctor.qualifications || '',
        status: editDoctor.status,
        bio: editDoctor.bio || '',
        schedule: editDoctor.schedule || initialSchedule,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setActiveTab('info');
  }, [editDoctor, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم مطلوب';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'التخصص مطلوب';
    }

    if (!formData.clinic) {
      newErrors.clinic = 'العيادة مطلوبة';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'صيغة الهاتف غير صحيحة (05XXXXXXXX)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'سنوات الخبرة مطلوبة';
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = 'أدخل رقماً صحيحاً';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setActiveTab('info');
      return;
    }

    const experienceNum = Number(formData.experience);
    const experienceText = experienceNum === 1 ? '1 سنة' : `${experienceNum} سنوات`;

    // Map schedule with dayKey for backend
    const scheduleWithDayKey = formData.schedule.map((day, index) => ({
      dayKey: weekDays[index].key,
      day: day.day,
      isWorking: day.isWorking,
      startTime: day.startTime,
      endTime: day.endTime,
    }));

    onSave({
      name: formData.fullName,
      specialty: formData.specialty,
      clinic: formData.clinic,
      phone: formData.phone,
      email: formData.email,
      experience: experienceText,
      qualifications: formData.qualifications,
      bio: formData.bio,
      status: formData.status,
      schedule: scheduleWithDayKey,
    });
  };

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleScheduleChange = (index: number, field: keyof WorkingDay, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {editDoctor ? 'تعديل بيانات الدكتور' : 'إضافة دكتور جديد'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {editDoctor ? 'تعديل البيانات والجدول الزمني' : 'أدخل بيانات الدكتور والجدول الزمني'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              المعلومات الأساسية
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              الجدول الزمني
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">المعلومات الشخصية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-foreground">
                      الاسم الكامل <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="د. أحمد محمد"
                      className={`mt-1.5 ${errors.fullName ? 'border-destructive' : ''}`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      التخصص <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => handleInputChange('specialty', value)}
                    >
                      <SelectTrigger className={`mt-1.5 ${errors.specialty ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialty && (
                      <p className="text-xs text-destructive mt-1">{errors.specialty}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      العيادة <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.clinic}
                      onValueChange={(value) => handleInputChange('clinic', value)}
                    >
                      <SelectTrigger className={`mt-1.5 ${errors.clinic ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="اختر العيادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinicOptions.map((clinic) => (
                          <SelectItem key={clinic} value={clinic}>
                            {clinic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.clinic && (
                      <p className="text-xs text-destructive mt-1">{errors.clinic}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      رقم الهاتف <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      className={`mt-1.5 text-right ${errors.phone ? 'border-destructive' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="doctor@example.com"
                      dir="ltr"
                      className={`mt-1.5 text-right ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      سنوات الخبرة <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="10"
                      className={`mt-1.5 ${errors.experience ? 'border-destructive' : ''}`}
                    />
                    {errors.experience && (
                      <p className="text-xs text-destructive mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">الحالة</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="في إجازة">في إجازة</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-foreground">المؤهلات العلمية</Label>
                    <Input
                      value={formData.qualifications}
                      onChange={(e) => handleInputChange('qualifications', e.target.value)}
                      placeholder="مثل: بكالوريوس طب، ماجستير جراحة"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-foreground">نبذة تعريفية</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="نبذة مختصرة عن الدكتور وخبراته..."
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">جدول العمل الأسبوعي</h3>
                <p className="text-sm text-muted-foreground">حدد أيام وساعات العمل</p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اليوم</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">يعمل</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">من</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">إلى</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.schedule.map((day, index) => (
                      <tr key={day.day} className={!day.isWorking ? 'bg-muted/30' : ''}>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{day.day}</td>
                        <td className="py-3 px-4 text-center">
                          <Switch
                            checked={day.isWorking}
                            onCheckedChange={(checked) => handleScheduleChange(index, 'isWorking', checked)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                            disabled={!day.isWorking}
                            className="w-28"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                            disabled={!day.isWorking}
                            className="w-28"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit}>
            {editDoctor ? 'حفظ التعديلات' : 'إضافة الدكتور'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
