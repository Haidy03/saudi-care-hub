import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormData {
  fullName: string;
  gender: 'male' | 'female' | '';
  birthDate: string;
  nationalId: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  bloodType: string;
  chronicDiseases: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const initialFormData: FormData = {
  fullName: '',
  gender: '',
  birthDate: '',
  nationalId: '',
  phone: '',
  altPhone: '',
  email: '',
  address: '',
  bloodType: '',
  chronicDiseases: '',
  allergies: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

export default function AddPatientModal({ isOpen, onClose, onSubmit }: AddPatientModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'الاسم الكامل مطلوب';
        if (value.trim().length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        return '';
      case 'gender':
        if (!value) return 'النوع مطلوب';
        return '';
      case 'birthDate':
        if (!value) return 'تاريخ الميلاد مطلوب';
        return '';
      case 'nationalId':
        if (!value.trim()) return 'رقم الهوية مطلوب';
        if (!/^\d{10}$/.test(value)) return 'رقم الهوية يجب أن يكون 10 أرقام';
        return '';
      case 'phone':
        if (!value.trim()) return 'رقم الهاتف مطلوب';
        if (!/^05\d{8}$/.test(value)) return 'رقم الهاتف غير صحيح (05XXXXXXXX)';
        return '';
      case 'altPhone':
        if (value && !/^05\d{8}$/.test(value)) return 'رقم الهاتف غير صحيح';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'البريد الإلكتروني غير صحيح';
        return '';
      case 'emergencyContactName':
        if (!value.trim()) return 'اسم جهة الاتصال مطلوب';
        return '';
      case 'emergencyContactPhone':
        if (!value.trim()) return 'رقم هاتف الطوارئ مطلوب';
        if (!/^05\d{8}$/.test(value)) return 'رقم الهاتف غير صحيح';
        return '';
      case 'emergencyContactRelation':
        if (!value) return 'صلة القرابة مطلوبة';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name as keyof FormData]) }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const requiredFields = [
      'fullName', 'gender', 'birthDate', 'nationalId', 'phone',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) newErrors[field] = error;
    });

    // Validate optional fields if they have values
    if (formData.altPhone) {
      const error = validateField('altPhone', formData.altPhone);
      if (error) newErrors.altPhone = error;
    }
    if (formData.email) {
      const error = validateField('email', formData.email);
      if (error) newErrors.email = error;
    }

    setErrors(newErrors);
    setTouched(Object.fromEntries(requiredFields.map(f => [f, true])));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialFormData);
      setErrors({});
      setTouched({});
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-card w-full max-w-[600px] max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">إضافة مريض جديد</h2>
            <p className="text-sm text-muted-foreground">أدخل بيانات المريض</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">المعلومات الشخصية</h3>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  الاسم الكامل <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="أدخل الاسم الكامل"
                  className={`${errors.fullName ? 'border-destructive focus:ring-destructive/20' : ''}`}
                />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>

              {/* Gender */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  النوع <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">ذكر</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">أنثى</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
              </div>

              {/* Birth Date & National ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    تاريخ الميلاد <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    onBlur={() => handleBlur('birthDate')}
                    className={`${errors.birthDate ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  />
                  {errors.birthDate && <p className="text-xs text-destructive mt-1">{errors.birthDate}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    رقم الهوية الوطنية <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    onBlur={() => handleBlur('nationalId')}
                    placeholder="10 أرقام"
                    dir="ltr"
                    className={`text-right ${errors.nationalId ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  />
                  {errors.nationalId && <p className="text-xs text-destructive mt-1">{errors.nationalId}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">معلومات الاتصال</h3>
            <div className="space-y-4">
              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    رقم الهاتف <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className={`text-right ${errors.phone ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    رقم بديل
                  </Label>
                  <Input
                    value={formData.altPhone}
                    onChange={(e) => handleChange('altPhone', e.target.value)}
                    onBlur={() => handleBlur('altPhone')}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className={`text-right ${errors.altPhone ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  />
                  {errors.altPhone && <p className="text-xs text-destructive mt-1">{errors.altPhone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="example@email.com"
                  dir="ltr"
                  className={`text-right ${errors.email ? 'border-destructive focus:ring-destructive/20' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  العنوان
                </Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="المدينة، الحي، الشارع..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">المعلومات الطبية</h3>
            <div className="space-y-4">
              {/* Blood Type */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  فصيلة الدم
                </Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleChange('bloodType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر فصيلة الدم" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">غير معروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chronic Diseases */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  الأمراض المزمنة
                </Label>
                <Textarea
                  value={formData.chronicDiseases}
                  onChange={(e) => handleChange('chronicDiseases', e.target.value)}
                  placeholder="مثل: السكري، الضغط..."
                  rows={2}
                />
              </div>

              {/* Allergies */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  الحساسية
                </Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="أدخل أي حساسية معروفة..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">جهة الاتصال في حالة الطوارئ</h3>
            <div className="space-y-4">
              {/* Contact Name */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  اسم جهة الاتصال <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  onBlur={() => handleBlur('emergencyContactName')}
                  placeholder="اسم الشخص للتواصل"
                  className={`${errors.emergencyContactName ? 'border-destructive focus:ring-destructive/20' : ''}`}
                />
                {errors.emergencyContactName && <p className="text-xs text-destructive mt-1">{errors.emergencyContactName}</p>}
              </div>

              {/* Contact Phone & Relation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    رقم الهاتف <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                    onBlur={() => handleBlur('emergencyContactPhone')}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className={`text-right ${errors.emergencyContactPhone ? 'border-destructive focus:ring-destructive/20' : ''}`}
                  />
                  {errors.emergencyContactPhone && <p className="text-xs text-destructive mt-1">{errors.emergencyContactPhone}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    صلة القرابة <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.emergencyContactRelation}
                    onValueChange={(value) => handleChange('emergencyContactRelation', value)}
                  >
                    <SelectTrigger className={`w-full ${errors.emergencyContactRelation ? 'border-destructive focus:ring-destructive/20' : ''}`}>
                      <SelectValue placeholder="اختر صلة القرابة" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="father">والد</SelectItem>
                      <SelectItem value="mother">والدة</SelectItem>
                      <SelectItem value="spouse">زوج/زوجة</SelectItem>
                      <SelectItem value="brother">أخ</SelectItem>
                      <SelectItem value="sister">أخت</SelectItem>
                      <SelectItem value="friend">صديق</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.emergencyContactRelation && <p className="text-xs text-destructive mt-1">{errors.emergencyContactRelation}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6"
          >
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
}
