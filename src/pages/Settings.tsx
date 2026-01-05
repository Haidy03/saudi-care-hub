import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useCenterSettings, 
  useSystemSettings, 
  useWorkingHours, 
  useUpdateCenterSettings, 
  useUpdateSystemSettings,
  useUpdateWorkingHours
} from '@/hooks/useSettings';
import { useClinicWithDoctorCount, useDeleteClinic } from '@/hooks/useClinics';

const DAYS_MAP: Record<string, string> = {
  'saturday': 'السبت',
  'sunday': 'الأحد',
  'monday': 'الإثنين',
  'tuesday': 'الثلاثاء',
  'wednesday': 'الأربعاء',
  'thursday': 'الخميس',
  'friday': 'الجمعة',
};

const CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'تبوك',
  'أبها',
  'القصيم',
];

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data
  const { data: centerSettings, isLoading: centerLoading } = useCenterSettings();
  const { data: systemSettings, isLoading: systemLoading } = useSystemSettings();
  const { data: workingHours = [], isLoading: hoursLoading } = useWorkingHours();
  const { data: clinicsWithCount = [], isLoading: clinicsLoading } = useClinicWithDoctorCount();

  // Mutations
  const updateCenterSettings = useUpdateCenterSettings();
  const updateSystemSettings = useUpdateSystemSettings();
  const updateWorkingHours = useUpdateWorkingHours();
  const deleteClinic = useDeleteClinic();

  // Center Info State
  const [centerInfo, setCenterInfo] = useState({
    nameAr: '',
    nameEn: '',
    phone: '',
    altPhone: '',
    email: '',
    website: '',
    address: '',
    city: 'الرياض',
    postalCode: '',
  });

  // Working Hours State
  const [localWorkingHours, setLocalWorkingHours] = useState<any[]>([]);

  // System Settings State
  const [localSystemSettings, setLocalSystemSettings] = useState({
    language: 'ar',
    dateFormat: 'gregorian',
    timeFormat: '12',
    timezone: 'Asia/Riyadh',
    defaultDuration: '30',
    sameDayBooking: true,
    minNotice: 2,
    smsEnabled: true,
    firstReminder: 24,
    secondReminder: 2,
    emailEnabled: false,
  });

  // Initialize states from fetched data
  useEffect(() => {
    if (centerSettings) {
      setCenterInfo({
        nameAr: centerSettings.name_ar || '',
        nameEn: centerSettings.name_en || '',
        phone: centerSettings.phone || '',
        altPhone: centerSettings.alt_phone || '',
        email: centerSettings.email || '',
        website: centerSettings.website || '',
        address: centerSettings.address || '',
        city: centerSettings.city || 'الرياض',
        postalCode: centerSettings.postal_code || '',
      });
    }
  }, [centerSettings]);

  useEffect(() => {
    if (workingHours.length > 0) {
      setLocalWorkingHours(workingHours.map(h => ({
        id: h.id,
        dayOfWeek: h.day_of_week,
        isOpen: h.is_open,
        openTime: h.open_time,
        closeTime: h.close_time,
      })));
    }
  }, [workingHours]);

  useEffect(() => {
    if (systemSettings) {
      setLocalSystemSettings({
        language: systemSettings.language || 'ar',
        dateFormat: systemSettings.date_format || 'gregorian',
        timeFormat: systemSettings.time_format || '12',
        timezone: systemSettings.timezone || 'Asia/Riyadh',
        defaultDuration: String(systemSettings.default_appointment_duration) || '30',
        sameDayBooking: systemSettings.same_day_booking ?? true,
        minNotice: systemSettings.min_notice_hours || 2,
        smsEnabled: systemSettings.sms_enabled ?? true,
        firstReminder: systemSettings.first_reminder_hours || 24,
        secondReminder: systemSettings.second_reminder_hours || 2,
        emailEnabled: systemSettings.email_enabled ?? false,
      });
    }
  }, [systemSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update center settings
      if (centerSettings?.id) {
        await updateCenterSettings.mutateAsync({
          id: centerSettings.id,
          name_ar: centerInfo.nameAr,
          name_en: centerInfo.nameEn,
          phone: centerInfo.phone,
          alt_phone: centerInfo.altPhone || null,
          email: centerInfo.email,
          website: centerInfo.website || null,
          address: centerInfo.address || null,
          city: centerInfo.city,
          postal_code: centerInfo.postalCode || null,
        });
      }

      // Update system settings
      if (systemSettings?.id) {
        await updateSystemSettings.mutateAsync({
          id: systemSettings.id,
          language: localSystemSettings.language,
          date_format: localSystemSettings.dateFormat,
          time_format: localSystemSettings.timeFormat,
          timezone: localSystemSettings.timezone,
          default_appointment_duration: parseInt(localSystemSettings.defaultDuration),
          same_day_booking: localSystemSettings.sameDayBooking,
          min_notice_hours: localSystemSettings.minNotice,
          sms_enabled: localSystemSettings.smsEnabled,
          first_reminder_hours: localSystemSettings.firstReminder,
          second_reminder_hours: localSystemSettings.secondReminder,
          email_enabled: localSystemSettings.emailEnabled,
        });
      }

      // Update working hours
      if (localWorkingHours.length > 0) {
        await updateWorkingHours.mutateAsync(
          localWorkingHours.map(h => ({
            id: h.id,
            is_open: h.isOpen,
            open_time: h.openTime,
            close_time: h.closeTime,
          }))
        );
      }

      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تحديث جميع الإعدادات",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleWorkingHoursChange = (dayOfWeek: string, field: string, value: boolean | string) => {
    setLocalWorkingHours(prev => 
      prev.map(h => 
        h.dayOfWeek === dayOfWeek 
          ? { ...h, [field]: value }
          : h
      )
    );
  };

  const handleDeleteClinic = async (id: string) => {
    try {
      await deleteClinic.mutateAsync(id);
      toast({
        title: "تم حذف العيادة",
        description: "تم حذف العيادة بنجاح",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف العيادة - قد تكون مرتبطة بأطباء أو مواعيد",
        variant: "destructive",
      });
    }
  };

  const isLoading = centerLoading || systemLoading || hoursLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">إدارة إعدادات المركز والنظام</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="center-info" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-0">
          <TabsTrigger
            value="center-info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
          >
            معلومات المركز
          </TabsTrigger>
          <TabsTrigger
            value="clinics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
          >
            إدارة العيادات
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
          >
            إعدادات النظام
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Center Info */}
        <TabsContent value="center-info" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-8">
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">اسم المركز (عربي)</Label>
                  <Input
                    id="nameAr"
                    value={centerInfo.nameAr}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, nameAr: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">اسم المركز (إنجليزي)</Label>
                  <Input
                    id="nameEn"
                    value={centerInfo.nameEn}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, nameEn: e.target.value }))}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>الشعار</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    تحميل شعار جديد
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">معلومات الاتصال</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={centerInfo.phone}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, phone: e.target.value }))}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altPhone">رقم بديل</Label>
                  <Input
                    id="altPhone"
                    value={centerInfo.altPhone}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, altPhone: e.target.value }))}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={centerInfo.email}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, email: e.target.value }))}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    type="url"
                    value={centerInfo.website}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, website: e.target.value }))}
                    dir="ltr"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">الموقع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={centerInfo.address}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="أدخل العنوان التفصيلي"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={centerInfo.city}
                    onValueChange={(value) => setCenterInfo(prev => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">الرمز البريدي</Label>
                  <Input
                    id="postalCode"
                    value={centerInfo.postalCode}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    dir="ltr"
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Working Hours */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">ساعات العمل</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-right">اليوم</TableHead>
                      <TableHead className="text-right">مفتوح</TableHead>
                      <TableHead className="text-right">من الساعة</TableHead>
                      <TableHead className="text-right">إلى الساعة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localWorkingHours.map(day => (
                      <TableRow key={day.dayOfWeek}>
                        <TableCell className="font-medium">{DAYS_MAP[day.dayOfWeek]}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={day.isOpen}
                            onCheckedChange={(checked) => handleWorkingHoursChange(day.dayOfWeek, 'isOpen', !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={day.openTime}
                            onChange={(e) => handleWorkingHoursChange(day.dayOfWeek, 'openTime', e.target.value)}
                            disabled={!day.isOpen}
                            className="w-32"
                            dir="ltr"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) => handleWorkingHoursChange(day.dayOfWeek, 'closeTime', e.target.value)}
                            disabled={!day.isOpen}
                            className="w-32"
                            dir="ltr"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Clinics Management */}
        <TabsContent value="clinics" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div />
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة عيادة
            </Button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">اسم العيادة</TableHead>
                  <TableHead className="text-right">عدد الأطباء</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : clinicsWithCount.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      لا توجد عيادات مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  clinicsWithCount.map(clinic => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>
                        {clinic.doctorCount} {clinic.doctorCount === 1 ? 'طبيب' : 'أطباء'}
                      </TableCell>
                      <TableCell>
                        <Badge className={clinic.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                          {clinic.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClinic(clinic.id)}
                            disabled={deleteClinic.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: System Settings */}
        <TabsContent value="system" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-8">
            {/* Section 1: Language & Localization */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">اللغة والتوطين</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>اللغة الافتراضية</Label>
                  <RadioGroup
                    value={localSystemSettings.language}
                    onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, language: value }))}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ar" id="lang-ar" />
                      <Label htmlFor="lang-ar" className="font-normal cursor-pointer">العربية</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en" className="font-normal cursor-pointer">English</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تنسيق التاريخ</Label>
                    <Select
                      value={localSystemSettings.dateFormat}
                      onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hijri">هجري</SelectItem>
                        <SelectItem value="gregorian">ميلادي</SelectItem>
                        <SelectItem value="both">هجري وميلادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المنطقة الزمنية</Label>
                    <Select
                      value={localSystemSettings.timezone}
                      onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">توقيت الرياض (UTC+3)</SelectItem>
                        <SelectItem value="Asia/Dubai">توقيت دبي (UTC+4)</SelectItem>
                        <SelectItem value="Asia/Kuwait">توقيت الكويت (UTC+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>تنسيق الوقت</Label>
                  <RadioGroup
                    value={localSystemSettings.timeFormat}
                    onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, timeFormat: value }))}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="12" id="time-12" />
                      <Label htmlFor="time-12" className="font-normal cursor-pointer">12 ساعة</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="24" id="time-24" />
                      <Label htmlFor="time-24" className="font-normal cursor-pointer">24 ساعة</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Section 2: Appointment Settings */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">إعدادات المواعيد</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>مدة الموعد الافتراضية</Label>
                    <Select
                      value={localSystemSettings.defaultDuration}
                      onValueChange={(value) => setLocalSystemSettings(prev => ({ ...prev, defaultDuration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 دقيقة</SelectItem>
                        <SelectItem value="30">30 دقيقة</SelectItem>
                        <SelectItem value="45">45 دقيقة</SelectItem>
                        <SelectItem value="60">60 دقيقة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأدنى للإشعار المسبق</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={localSystemSettings.minNotice}
                        onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, minNotice: parseInt(e.target.value) || 0 }))}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">ساعات</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>السماح بالمواعيد في نفس اليوم</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      السماح للمرضى بحجز مواعيد في نفس يوم الحجز
                    </p>
                  </div>
                  <Switch
                    checked={localSystemSettings.sameDayBooking}
                    onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, sameDayBooking: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Reminder Settings */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">إعدادات التذكير</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>تفعيل تذكير SMS</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      إرسال رسائل تذكير للمرضى قبل المواعيد
                    </p>
                  </div>
                  <Switch
                    checked={localSystemSettings.smsEnabled}
                    onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>

                {localSystemSettings.smsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    <div className="space-y-2">
                      <Label>التذكير الأول</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={localSystemSettings.firstReminder}
                          onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, firstReminder: parseInt(e.target.value) || 24 }))}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">ساعات قبل الموعد</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>التذكير الثاني</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={localSystemSettings.secondReminder}
                          onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, secondReminder: parseInt(e.target.value) || 2 }))}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">ساعات قبل الموعد</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>تفعيل تذكير البريد الإلكتروني</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      إرسال رسائل بريد إلكتروني تذكيرية للمرضى
                    </p>
                  </div>
                  <Switch
                    checked={localSystemSettings.emailEnabled}
                    onCheckedChange={(checked) => setLocalSystemSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t border-border -mx-6 px-6">
        <Button 
          onClick={handleSave} 
          className="w-full md:w-auto gap-2"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
