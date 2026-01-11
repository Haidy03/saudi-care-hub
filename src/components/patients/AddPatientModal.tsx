import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';

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
  // New fields from the wizard
  maritalStatus: string;
  occupation: string;
  nationality: string;
  insuranceProvider: string;
  insuranceNumber: string;
  historicalMedicalConditions: string;
  currentMedications: string;
  isSmoker: boolean;
  hasInsurance: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface Patient {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string;
  national_id: string;
  phone: string;
  alt_phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: string | null;
  chronic_diseases: string | null;
  allergies: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  marital_status: string | null;
  occupation: string | null;
  nationality: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  historical_medical_conditions: string | null;
  current_medications: string | null;
  is_smoker: boolean | null;
  has_insurance: boolean | null;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editingPatient?: Patient | null;
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
  maritalStatus: '',
  occupation: '',
  nationality: 'سعودي',
  insuranceProvider: '',
  insuranceNumber: '',
  historicalMedicalConditions: '',
  currentMedications: '',
  isSmoker: false,
  hasInsurance: false,
};

export default function AddPatientModal({ isOpen, onClose, onSubmit, editingPatient }: AddPatientModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Pre-fill form when editing
  useEffect(() => {
    if (editingPatient) {
      setFormData({
        fullName: editingPatient.full_name,
        gender: editingPatient.gender as 'male' | 'female',
        birthDate: editingPatient.birth_date,
        nationalId: editingPatient.national_id,
        phone: editingPatient.phone,
        altPhone: editingPatient.alt_phone || '',
        email: editingPatient.email || '',
        address: editingPatient.address || '',
        bloodType: editingPatient.blood_type || '',
        chronicDiseases: editingPatient.chronic_diseases || '',
        allergies: editingPatient.allergies || '',
        emergencyContactName: editingPatient.emergency_contact_name,
        emergencyContactPhone: editingPatient.emergency_contact_phone,
        emergencyContactRelation: editingPatient.emergency_contact_relation,
        maritalStatus: editingPatient.marital_status || '',
        occupation: editingPatient.occupation || '',
        nationality: editingPatient.nationality || 'سعودي',
        insuranceProvider: editingPatient.insurance_provider || '',
        insuranceNumber: editingPatient.insurance_number || '',
        historicalMedicalConditions: editingPatient.historical_medical_conditions || '',
        currentMedications: editingPatient.current_medications || '',
        isSmoker: editingPatient.is_smoker || false,
        hasInsurance: editingPatient.has_insurance || false,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingPatient]);

  const steps = [
    { number: 1, title: 'المعلومات الأساسية' },
    { number: 2, title: 'معلومات الاتصال' },
    { number: 3, title: 'المعلومات الطبية' },
  ];

  const validateField = (name: string, value: string | boolean): string => {
    const stringValue = typeof value === 'boolean' ? '' : value;

    switch (name) {
      case 'fullName':
        if (!stringValue.trim()) return 'الاسم الكامل مطلوب';
        if (stringValue.trim().length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        return '';
      case 'gender':
        if (!stringValue) return 'النوع مطلوب';
        return '';
      case 'birthDate':
        if (!stringValue) return 'تاريخ الميلاد مطلوب';
        return '';
      case 'nationalId':
        if (!stringValue.trim()) return 'رقم الهوية مطلوب';
        if (!/^\d{10}$/.test(stringValue)) return 'رقم الهوية يجب أن يكون 10 أرقام';
        return '';
      case 'phone':
        if (!stringValue.trim()) return 'رقم الهاتف مطلوب';
        if (!/^05\d{8}$/.test(stringValue)) return 'رقم الهاتف غير صحيح (05XXXXXXXX)';
        return '';
      case 'altPhone':
        if (stringValue && !/^05\d{8}$/.test(stringValue)) return 'رقم الهاتف غير صحيح';
        return '';
      case 'email':
        if (stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'البريد الإلكتروني غير صحيح';
        return '';
      case 'emergencyContactName':
        if (!stringValue.trim()) return 'اسم جهة الاتصال مطلوب';
        return '';
      case 'emergencyContactPhone':
        if (!stringValue.trim()) return 'رقم هاتف الطوارئ مطلوب';
        if (!/^05\d{8}$/.test(stringValue)) return 'رقم الهاتف غير صحيح';
        return '';
      case 'emergencyContactRelation':
        if (!stringValue) return 'صلة القرابة مطلوبة';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name as keyof FormData]) }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['fullName', 'gender', 'birthDate', 'nationalId'];
        break;
      case 2:
        fieldsToValidate = ['phone', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
        // Validate optional fields if they have values
        if (formData.altPhone) fieldsToValidate.push('altPhone');
        if (formData.email) fieldsToValidate.push('email');
        break;
      case 3:
        // Medical info is optional, no required validations
        break;
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(Object.fromEntries(fieldsToValidate.map(f => [f, true])));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-card w-full max-w-[900px] max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      currentStep === step.number
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-16 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Full Name */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  الاسم <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="الاسم الكامل"
                  className={`h-11 ${errors.fullName ? 'border-destructive' : ''}`}
                />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>

              {/* Gender and Birth Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    النوع <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger className={`h-11 ${errors.gender ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    تاريخ الميلاد <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    onBlur={() => handleBlur('birthDate')}
                    className={`h-11 ${errors.birthDate ? 'border-destructive' : ''}`}
                  />
                  {errors.birthDate && <p className="text-xs text-destructive mt-1">{errors.birthDate}</p>}
                </div>
              </div>

              {/* National ID and Nationality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    رقم الهوية <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    onBlur={() => handleBlur('nationalId')}
                    placeholder="10 أرقام"
                    dir="ltr"
                    className={`h-11 text-right ${errors.nationalId ? 'border-destructive' : ''}`}
                  />
                  {errors.nationalId && <p className="text-xs text-destructive mt-1">{errors.nationalId}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    الجنسية
                  </Label>
                  <Input
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    placeholder="الجنسية"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Marital Status and Occupation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    الحالة الاجتماعية
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleChange('maritalStatus', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">أعزب/عزباء</SelectItem>
                      <SelectItem value="married">متزوج/متزوجة</SelectItem>
                      <SelectItem value="divorced">مطلق/مطلقة</SelectItem>
                      <SelectItem value="widowed">أرمل/أرملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    الوظيفة
                  </Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="الوظيفة الحالية"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
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
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    رقم الاتصال <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className={`h-11 text-right ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    كود
                  </Label>
                  <Input
                    value="966"
                    disabled
                    dir="ltr"
                    className="h-11 text-right bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="example@email.com"
                  dir="ltr"
                  className={`h-11 text-right ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div className="border-t border-border pt-5 mt-6">
                <h3 className="font-semibold text-foreground mb-4">جهة الاتصال في حالة الطوارئ</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      اسم جهة الاتصال الطارئة <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.emergencyContactName}
                      onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                      onBlur={() => handleBlur('emergencyContactName')}
                      placeholder="الاسم الكامل"
                      className={`h-11 ${errors.emergencyContactName ? 'border-destructive' : ''}`}
                    />
                    {errors.emergencyContactName && <p className="text-xs text-destructive mt-1">{errors.emergencyContactName}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      رقم جهة الاتصال الطارئة <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                      onBlur={() => handleBlur('emergencyContactPhone')}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      className={`h-11 text-right ${errors.emergencyContactPhone ? 'border-destructive' : ''}`}
                    />
                    {errors.emergencyContactPhone && <p className="text-xs text-destructive mt-1">{errors.emergencyContactPhone}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      صلة القرابة <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.emergencyContactRelation}
                      onValueChange={(value) => handleChange('emergencyContactRelation', value)}
                    >
                      <SelectTrigger className={`h-11 ${errors.emergencyContactRelation ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="اختر صلة القرابة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">والد</SelectItem>
                        <SelectItem value="mother">والدة</SelectItem>
                        <SelectItem value="spouse">زوج/زوجة</SelectItem>
                        <SelectItem value="brother">أخ</SelectItem>
                        <SelectItem value="sister">أخت</SelectItem>
                        <SelectItem value="son">ابن</SelectItem>
                        <SelectItem value="daughter">ابنة</SelectItem>
                        <SelectItem value="friend">صديق</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.emergencyContactRelation && <p className="text-xs text-destructive mt-1">{errors.emergencyContactRelation}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  فصيلة الدم
                </Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleChange('bloodType', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر فصيلة الدم" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  التاريخ الطبي
                </Label>
                <Textarea
                  value={formData.historicalMedicalConditions}
                  onChange={(e) => handleChange('historicalMedicalConditions', e.target.value)}
                  placeholder="السجل الطبي السابق..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  الأدوية الحالية
                </Label>
                <Textarea
                  value={formData.currentMedications}
                  onChange={(e) => handleChange('currentMedications', e.target.value)}
                  placeholder="الأدوية التي يتناولها المريض حالياً..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  الأمراض المزمنة
                </Label>
                <Textarea
                  value={formData.chronicDiseases}
                  onChange={(e) => handleChange('chronicDiseases', e.target.value)}
                  placeholder="مثل: السكري، الضغط..."
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  الحساسية
                </Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="أي حساسية معروفة..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium text-foreground">
                  مدخن
                </Label>
                <Switch
                  checked={formData.isSmoker}
                  onCheckedChange={(checked) => handleChange('isSmoker', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium text-foreground">
                  لديه تأمين
                </Label>
                <Switch
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => handleChange('hasInsurance', checked)}
                />
              </div>

              {formData.hasInsurance && (
                <div className="space-y-4 p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      اسم جهة التأمين
                    </Label>
                    <Input
                      value={formData.insuranceProvider}
                      onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                      placeholder="اسم شركة التأمين"
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      رقم التأمين
                    </Label>
                    <Input
                      value={formData.insuranceNumber}
                      onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                      placeholder="رقم بوليصة التأمين"
                      className="h-11"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="px-6"
          >
            {currentStep === 1 ? 'رجوع' : 'التالي'}
          </Button>

          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            className="px-6 bg-primary hover:bg-primary/90"
          >
            {currentStep === 3 ? (editingPatient ? 'تحديث' : 'حفظ') : 'التالي'}
          </Button>
        </div>
      </div>
    </div>
  );
}
