import { useState, useMemo, useEffect } from 'react';
import { X, Search, UserPlus, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useClinics } from '@/hooks/useClinics';
import { useDoctorsByClinic, useDoctorSchedule } from '@/hooks/useDoctors';
import { useSearchPatients, usePatients, Patient, calculateAge } from '@/hooks/usePatients';
import { useBookedSlots } from '@/hooks/useAppointments';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  onAddNewPatient: () => void;
  editAppointment?: {
    id: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinic: string;
    doctorId: string;
    doctor: string;
    date: string;
    time: string;
    appointmentType: string;
    reason: string;
    notes: string;
    sendReminder: boolean;
  } | null;
}

interface AppointmentFormData {
  id?: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinic: string;
  doctorId: string;
  doctor: string;
  date: string;
  time: string;
  appointmentType: string;
  reason: string;
  notes: string;
  sendReminder: boolean;
}

const timeSlots = [
  '08:00 ص', '08:30 ص', '09:00 ص', '09:30 ص',
  '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص',
  '12:00 م', '12:30 م', '01:00 م', '01:30 م',
  '02:00 م', '02:30 م', '03:00 م', '03:30 م',
  '04:00 م', '04:30 م', '05:00 م', '05:30 م',
];

const appointmentTypes = [
  { id: 'general', name: 'كشف عام' },
  { id: 'followup', name: 'متابعة' },
  { id: 'consultation', name: 'استشارة' },
  { id: 'emergency', name: 'طوارئ' },
];

const steps = [
  { id: 1, title: 'اختر المريض' },
  { id: 2, title: 'العيادة والدكتور' },
  { id: 3, title: 'التاريخ والوقت' },
  { id: 4, title: 'التفاصيل' },
];

// Helper function to convert display time to database format for comparison
function displayTimeToDbTime(displayTime: string): string {
  const match = displayTime.match(/(\d{2}):(\d{2})\s*(ص|م)/);
  if (!match) return displayTime;

  let [, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);

  if (period === 'م' && hour !== 12) {
    hour += 12;
  } else if (period === 'ص' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}:00`;
}

// Map day names to database keys
const dayOfWeekMap: { [key: number]: string } = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// Convert time string (HH:MM:SS or HH:MM) to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  onAddNewPatient,
  editAppointment,
}: BookAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [sendReminder, setSendReminder] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch data from database
  const { data: clinics = [], isLoading: clinicsLoading } = useClinics();
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctorsByClinic(selectedClinic);
  const { data: patients = [] } = usePatients();
  const { data: doctorSchedule = [] } = useDoctorSchedule(selectedDoctor || '');

  // Get booked slots for selected doctor and date
  const { data: bookedSlots = [] } = useBookedSlots(
    selectedDoctor,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  );

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (p) => p.full_name.toLowerCase().includes(query) || p.phone.includes(query)
    ).slice(0, 10);
  }, [searchQuery, patients]);

  // Check if a date is a working day for the doctor
  const isDoctorWorkingDay = (date: Date): boolean => {
    if (!selectedDoctor || doctorSchedule.length === 0) return true; // Allow all days if no schedule
    const dayKey = dayOfWeekMap[date.getDay()];
    const daySchedule = doctorSchedule.find(s => s.day_of_week === dayKey);
    return daySchedule?.is_working ?? false;
  };

  // Get doctor's working hours for the selected date
  const getDoctorWorkingHours = (): { start: number; end: number } | null => {
    if (!selectedDate || !selectedDoctor || doctorSchedule.length === 0) return null;
    const dayKey = dayOfWeekMap[selectedDate.getDay()];
    const daySchedule = doctorSchedule.find(s => s.day_of_week === dayKey);

    if (!daySchedule || !daySchedule.is_working) return null;

    return {
      start: timeToMinutes(daySchedule.start_time),
      end: timeToMinutes(daySchedule.end_time),
    };
  };

  // Filter available time slots based on doctor's schedule
  const availableTimeSlots = useMemo(() => {
    const workingHours = getDoctorWorkingHours();

    if (!workingHours) return [];

    return timeSlots.filter(slot => {
      const slotTime = displayTimeToDbTime(slot);
      const slotMinutes = timeToMinutes(slotTime);
      return slotMinutes >= workingHours.start && slotMinutes < workingHours.end;
    });
  }, [selectedDate, selectedDoctor, doctorSchedule]);

  // Check if a time slot is booked
  const isTimeSlotBooked = (slot: string): boolean => {
    const slotDbTime = displayTimeToDbTime(slot);
    return bookedSlots.some(bookedTime => bookedTime === slotDbTime);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!selectedPatient) {
          newErrors.patient = 'يرجى اختيار مريض';
        }
        break;
      case 2:
        if (!selectedClinic) newErrors.clinic = 'يرجى اختيار العيادة';
        if (!selectedDoctor) newErrors.doctor = 'يرجى اختيار الدكتور';
        break;
      case 3:
        if (!selectedDate) newErrors.date = 'يرجى اختيار التاريخ';
        if (!selectedTime) newErrors.time = 'يرجى اختيار الوقت';
        break;
      case 4:
        if (!appointmentType) newErrors.appointmentType = 'يرجى اختيار نوع الموعد';
        if (!reason.trim()) newErrors.reason = 'يرجى إدخال سبب الزيارة';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedPatient || !selectedDate) return;

    const clinicData = clinics.find((c) => c.id === selectedClinic);
    const doctorData = doctors.find((d) => d.id === selectedDoctor);

    onSubmit({
      ...(editAppointment && { id: editAppointment.id }),
      patientId: selectedPatient.id,
      patientName: selectedPatient.full_name,
      clinicId: selectedClinic,
      clinic: clinicData?.name || '',
      doctorId: selectedDoctor,
      doctor: doctorData?.name || '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      appointmentType,
      reason,
      notes,
      sendReminder,
    });

    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSearchQuery('');
    setSelectedPatient(null);
    setSelectedClinic('');
    setSelectedDoctor('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setAppointmentType('');
    setReason('');
    setNotes('');
    setSendReminder(true);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Populate form when editing
  useEffect(() => {
    if (editAppointment && isOpen) {
      // Find the patient from the list
      const patient = patients.find(p => p.id === editAppointment.patientId);
      if (patient) {
        setSelectedPatient(patient);
      }

      setSelectedClinic(editAppointment.clinicId);
      setSelectedDoctor(editAppointment.doctorId);
      setSelectedDate(new Date(editAppointment.date));
      setSelectedTime(editAppointment.time);
      setAppointmentType(editAppointment.appointmentType);
      setReason(editAppointment.reason);
      setNotes(editAppointment.notes);
      setSendReminder(editAppointment.sendReminder);
      setCurrentStep(1);
    }
  }, [editAppointment, isOpen, patients]);

  // Reset doctor when clinic changes
  useEffect(() => {
    if (!editAppointment) {
      setSelectedDoctor('');
    }
  }, [selectedClinic, editAppointment]);

  // Reset time when date changes
  useEffect(() => {
    if (!editAppointment) {
      setSelectedTime('');
    }
  }, [selectedDate, editAppointment]);

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
            <h2 className="text-xl font-bold text-foreground">
              {editAppointment ? 'تعديل الموعد' : 'حجز موعد جديد'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editAppointment ? 'تعديل بيانات الموعد' : 'املأ بيانات الموعد'}
            </p>
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
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-1 hidden sm:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-8 sm:w-12 mx-2',
                      currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Patient */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  البحث عن مريض <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن المريض بالاسم أو رقم الهاتف"
                    className="pr-10"
                  />
                </div>
                {errors.patient && (
                  <p className="text-xs text-destructive mt-1">{errors.patient}</p>
                )}
              </div>

              {/* Search Results */}
              {searchQuery && filteredPatients.length > 0 && !selectedPatient && (
                <div className="border border-border rounded-lg overflow-hidden bg-popover">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchQuery('');
                        setErrors({});
                      }}
                      className="w-full px-4 py-3 text-right hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-medium text-foreground">{patient.full_name}</div>
                      <div className="text-sm text-muted-foreground" dir="ltr">
                        {patient.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && filteredPatients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد نتائج مطابقة
                </p>
              )}

              {/* Selected Patient Card */}
              {selectedPatient && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {selectedPatient.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {selectedPatient.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground" dir="ltr">
                          {selectedPatient.phone} • {calculateAge(selectedPatient.birth_date)} سنة
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-sm text-destructive hover:underline"
                    >
                      تغيير
                    </button>
                  </div>
                </div>
              )}

              {/* Add New Patient */}
              <Button
                variant="outline"
                onClick={onAddNewPatient}
                className="w-full gap-2 border-dashed"
              >
                <UserPlus className="w-4 h-4" />
                مريض جديد
              </Button>
            </div>
          )}

          {/* Step 2: Select Clinic & Doctor */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  العيادة <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedClinic}
                  onValueChange={(value) => {
                    setSelectedClinic(value);
                  }}
                >
                  <SelectTrigger
                    className={errors.clinic ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="اختر العيادة" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {clinicsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : (
                      clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.clinic && (
                  <p className="text-xs text-destructive mt-1">{errors.clinic}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  الدكتور <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                  disabled={!selectedClinic}
                >
                  <SelectTrigger
                    className={errors.doctor ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder={!selectedClinic ? 'اختر العيادة أولاً' : 'اختر الدكتور'} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {doctorsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : doctors.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        لا يوجد أطباء في هذه العيادة
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.doctor && (
                  <p className="text-xs text-destructive mt-1">{errors.doctor}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  التاريخ <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-right font-normal',
                        !selectedDate && 'text-muted-foreground',
                        errors.date && 'border-destructive'
                      )}
                    >
                      {selectedDate
                        ? format(selectedDate, 'PPP', { locale: ar })
                        : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;

                        // Disable non-working days for the doctor
                        return !isDoctorWorkingDay(date);
                      }}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-xs text-destructive mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  الوقت <span className="text-destructive">*</span>
                </Label>
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">لا توجد أوقات متاحة في هذا اليوم</p>
                    <p className="text-xs mt-1">يرجى اختيار يوم آخر</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((slot) => {
                      const isBooked = isTimeSlotBooked(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => !isBooked && setSelectedTime(slot)}
                          disabled={isBooked}
                          className={cn(
                            'py-2 px-3 text-sm rounded-lg border transition-colors',
                            isBooked
                              ? 'bg-muted text-muted-foreground cursor-not-allowed border-muted'
                              : isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card hover:bg-primary/10 hover:border-primary border-border'
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.time && (
                  <p className="text-xs text-destructive mt-1">{errors.time}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  نوع الموعد <span className="text-destructive">*</span>
                </Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger
                    className={errors.appointmentType ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="اختر نوع الموعد" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.appointmentType && (
                  <p className="text-xs text-destructive mt-1">{errors.appointmentType}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  سبب الزيارة <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثل: ألم في الأسنان"
                  className={errors.reason ? 'border-destructive' : ''}
                />
                {errors.reason && (
                  <p className="text-xs text-destructive mt-1">{errors.reason}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  ملاحظات
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    إرسال تذكير
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    إرسال رسالة تذكير للمريض قبل الموعد
                  </p>
                </div>
                <Switch checked={sendReminder} onCheckedChange={setSendReminder} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrev}
            className="gap-2"
          >
            {currentStep === 1 ? (
              'إلغاء'
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                السابق
              </>
            )}
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep === 4 ? (
              editAppointment ? 'حفظ التعديلات' : 'حفظ'
            ) : (
              <>
                التالي
                <ChevronLeft className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
