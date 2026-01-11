import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { calculateAge } from '@/hooks/usePatients';
import type { Patient } from '@/hooks/usePatients';

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export default function ViewPatientModal({ isOpen, onClose, patient }: ViewPatientModalProps) {
  if (!patient) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined | boolean }) => {
    if (!value && value !== false) return null;

    const displayValue = typeof value === 'boolean'
      ? (value ? 'نعم' : 'لا')
      : value;

    return (
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">{label}</label>
        <div className="text-base font-medium text-foreground">{displayValue}</div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {patient.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">معلومات المريض</h2>
                <p className="text-sm text-muted-foreground">عرض تفاصيل المريض</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">المعلومات الأساسية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow label="الاسم" value={patient.full_name} />
              <InfoRow label="النوع" value={patient.gender === 'male' ? 'ذكر' : 'أنثى'} />
              <InfoRow label="رقم الهوية" value={patient.national_id} />
              <InfoRow label="الجنسية" value={patient.nationality} />
              <InfoRow label="تاريخ الميلاد" value={new Date(patient.birth_date).toLocaleDateString('ar-SA')} />
              <InfoRow label="العمر" value={`${calculateAge(patient.birth_date)} سنة`} />
              <InfoRow label="الحالة الاجتماعية" value={patient.marital_status} />
              <InfoRow label="الوظيفة" value={patient.occupation} />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">معلومات الاتصال</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow label="رقم الهاتف" value={patient.phone} />
              <InfoRow label="رقم الهاتف البديل" value={patient.alt_phone} />
              <InfoRow label="البريد الإلكتروني" value={patient.email} />
              <div className="md:col-span-2">
                <InfoRow label="العنوان" value={patient.address} />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">المعلومات الطبية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow label="فصيلة الدم" value={patient.blood_type} />
              <InfoRow label="مدخن" value={patient.is_smoker} />
              <div className="md:col-span-2">
                <InfoRow label="الأمراض المزمنة" value={patient.chronic_diseases} />
              </div>
              <div className="md:col-span-2">
                <InfoRow label="الحساسية" value={patient.allergies} />
              </div>
              <div className="md:col-span-2">
                <InfoRow label="الحالات الطبية السابقة" value={patient.historical_medical_conditions} />
              </div>
              <div className="md:col-span-2">
                <InfoRow label="الأدوية الحالية" value={patient.current_medications} />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">معلومات التأمين</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow label="لديه تأمين" value={patient.has_insurance} />
              <InfoRow label="مزود التأمين" value={patient.insurance_provider} />
              <div className="md:col-span-2">
                <InfoRow label="رقم التأمين" value={patient.insurance_number} />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">جهة الاتصال الطارئة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow label="اسم جهة الاتصال الطارئة" value={patient.emergency_contact_name} />
              <InfoRow label="رقم جهة الاتصال الطارئة" value={patient.emergency_contact_phone} />
              <div className="md:col-span-2">
                <InfoRow label="صلة القرابة" value={patient.emergency_contact_relation} />
              </div>
            </div>
          </div>

          {/* Registration Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">معلومات التسجيل</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <InfoRow
                label="تاريخ التسجيل"
                value={new Date(patient.created_at).toLocaleDateString('ar-SA')}
              />
              <InfoRow
                label="آخر تحديث"
                value={new Date(patient.updated_at).toLocaleDateString('ar-SA')}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
