import { useState } from 'react';
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

const DAYS = [
  { id: 'saturday', label: 'السبت' },
  { id: 'sunday', label: 'الأحد' },
  { id: 'monday', label: 'الإثنين' },
  { id: 'tuesday', label: 'الثلاثاء' },
  { id: 'wednesday', label: 'الأربعاء' },
  { id: 'thursday', label: 'الخميس' },
  { id: 'friday', label: 'الجمعة' },
];

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

const initialClinics = [
  { id: 1, name: 'عيادة الأسنان', doctorCount: 3, status: 'active' },
  { id: 2, name: 'عيادة العظام', doctorCount: 2, status: 'active' },
  { id: 3, name: 'عيادة الجلدية', doctorCount: 2, status: 'active' },
  { id: 4, name: 'عيادة الأطفال', doctorCount: 1, status: 'active' },
  { id: 5, name: 'عيادة الباطنة', doctorCount: 2, status: 'active' },
];

const initialWorkingHours = DAYS.reduce((acc, day) => {
  acc[day.id] = {
    isOpen: day.id !== 'friday',
    from: '08:00',
    to: '17:00',
  };
  return acc;
}, {} as Record<string, { isOpen: boolean; from: string; to: string }>);

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [clinics, setClinics] = useState(initialClinics);

  // Center Info State
  const [centerInfo, setCenterInfo] = useState({
    nameAr: 'مركز الرعاية الصحية',
    nameEn: 'Healthcare Center',
    phone: '0112345678',
    altPhone: '',
    email: 'info@healthcare.sa',
    website: '',
    address: '',
    city: 'الرياض',
    postalCode: '',
  });

  const [workingHours, setWorkingHours] = useState(initialWorkingHours);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
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

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({
      title: "تم حفظ الإعدادات بنجاح",
      description: "تم تحديث جميع الإعدادات",
    });
  };

  const handleWorkingHoursChange = (dayId: string, field: string, value: boolean | string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  const handleDeleteClinic = (id: number) => {
    setClinics(prev => prev.filter(clinic => clinic.id !== id));
    toast({
      title: "تم حذف العيادة",
      description: "تم حذف العيادة بنجاح",
    });
  };

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
                    {DAYS.map(day => (
                      <TableRow key={day.id}>
                        <TableCell className="font-medium">{day.label}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={workingHours[day.id].isOpen}
                            onCheckedChange={(checked) => handleWorkingHoursChange(day.id, 'isOpen', !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={workingHours[day.id].from}
                            onChange={(e) => handleWorkingHoursChange(day.id, 'from', e.target.value)}
                            disabled={!workingHours[day.id].isOpen}
                            className="w-32"
                            dir="ltr"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={workingHours[day.id].to}
                            onChange={(e) => handleWorkingHoursChange(day.id, 'to', e.target.value)}
                            disabled={!workingHours[day.id].isOpen}
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
                {clinics.map(clinic => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>
                      {clinic.doctorCount} {clinic.doctorCount === 1 ? 'طبيب' : 'أطباء'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        نشط
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                    value={systemSettings.language}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}
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
                      value={systemSettings.dateFormat}
                      onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}
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
                      value={systemSettings.timezone}
                      onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                        <SelectItem value="Asia/Kuwait">Asia/Kuwait (UTC+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>تنسيق الوقت</Label>
                  <RadioGroup
                    value={systemSettings.timeFormat}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timeFormat: value }))}
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
                <div className="space-y-2">
                  <Label>مدة الموعد الافتراضية</Label>
                  <Select
                    value={systemSettings.defaultDuration}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultDuration: value }))}
                  >
                    <SelectTrigger className="w-48">
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

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <Label htmlFor="same-day" className="font-normal">السماح بالمواعيد في نفس اليوم</Label>
                  <Switch
                    id="same-day"
                    checked={systemSettings.sameDayBooking}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, sameDayBooking: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الحد الأدنى للإشعار المسبق</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={systemSettings.minNotice}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, minNotice: parseInt(e.target.value) || 0 }))}
                      className="w-24"
                      dir="ltr"
                      min={0}
                    />
                    <span className="text-muted-foreground">ساعات</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Reminder Settings */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">إعدادات التذكير</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <Label htmlFor="sms-enabled" className="font-normal">تفعيل تذكير SMS</Label>
                  <Switch
                    id="sms-enabled"
                    checked={systemSettings.smsEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>

                {systemSettings.smsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ps-4 border-s-2 border-primary/20">
                    <div className="space-y-2">
                      <Label>التذكير الأول</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={systemSettings.firstReminder}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, firstReminder: parseInt(e.target.value) || 0 }))}
                          className="w-24"
                          dir="ltr"
                          min={0}
                        />
                        <span className="text-muted-foreground text-sm">ساعات قبل الموعد</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>التذكير الثاني</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={systemSettings.secondReminder}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, secondReminder: parseInt(e.target.value) || 0 }))}
                          className="w-24"
                          dir="ltr"
                          min={0}
                        />
                        <span className="text-muted-foreground text-sm">ساعات قبل الموعد</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <Label htmlFor="email-enabled" className="font-normal">تفعيل تذكير البريد الإلكتروني</Label>
                  <Switch
                    id="email-enabled"
                    checked={systemSettings.emailEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t border-border -mx-6 px-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full max-w-md mx-auto flex gap-2"
          size="lg"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
