import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ref, push, set, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, LogIn, LogOut } from 'lucide-react';

interface DoctorDashboardProps {
  doctorCode: string;
  doctorName: string;
  onLogout: () => void;
}

const DoctorDashboard = ({ doctorCode, doctorName, onLogout }: DoctorDashboardProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [selectedVacationDay, setSelectedVacationDay] = useState('');
  const { toast } = useToast();

  const daysOfWeek = [
    { value: 'sunday', label: 'الأحد' },
    { value: 'monday', label: 'الإثنين' },
    { value: 'tuesday', label: 'الثلاثاء' },
    { value: 'wednesday', label: 'الأربعاء' },
    { value: 'thursday', label: 'الخميس' },
    { value: 'friday', label: 'الجمعة' },
    { value: 'saturday', label: 'السبت' }
  ];

  useEffect(() => {
    const attendanceRef = ref(database, `attendance/${doctorCode}/today`);
    
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.checkIn && !data.checkOut) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(data.checkIn));
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    });

    return () => off(attendanceRef);
  }, [doctorCode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
        setWorkingTime(diff);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, checkInTime]);

  const formatWorkingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 10) {
      toast({
        title: "غير مسموح",
        description: "التسجيل يبدأ من الساعة 10 صباحاً",
        variant: "destructive"
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceRef = ref(database, `attendance/${doctorCode}/today`);
      
      await set(attendanceRef, {
        checkIn: now.toISOString(),
        date: today,
        doctorName
      });

      setIsCheckedIn(true);
      setCheckInTime(now);
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الحضور",
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الحضور",
        variant: "destructive"
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = new Date();
      const attendanceRef = ref(database, `attendance/${doctorCode}/today`);
      
      const attendanceData = {
        checkIn: checkInTime?.toISOString(),
        checkOut: now.toISOString(),
        date: new Date().toISOString().split('T')[0],
        doctorName,
        workingHours: formatWorkingTime(workingTime)
      };

      await set(attendanceRef, attendanceData);

      // Save to history
      const historyRef = ref(database, `attendance/${doctorCode}/history`);
      await push(historyRef, attendanceData);

      setIsCheckedIn(false);
      setCheckInTime(null);
      setWorkingTime(0);
      
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الانصراف",
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الانصراف",
        variant: "destructive"
      });
    }
  };

  const handleVacationRequest = async () => {
    if (!selectedVacationDay) {
      toast({
        title: "خطأ",
        description: "من فضلك اختر يوم الإجازة",
        variant: "destructive"
      });
      return;
    }

    try {
      const vacationRef = ref(database, `vacations/${doctorCode}`);
      await set(vacationRef, {
        day: selectedVacationDay,
        doctorName,
        requestDate: new Date().toISOString()
      });

      toast({
        title: "تم بنجاح",
        description: `تم حفظ يوم الإجازة: ${daysOfWeek.find(d => d.value === selectedVacationDay)?.label}`,
      });
    } catch (error) {
      console.error('Error setting vacation:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ يوم الإجازة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{doctorName}</CardTitle>
          <Badge variant={isCheckedIn ? "default" : "secondary"} className="w-fit mx-auto">
            {isCheckedIn ? "متواجد" : "غير متواجد"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCheckedIn && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <span>وقت العمل:</span>
              </div>
              <div className="text-3xl font-mono font-bold text-primary">
                {formatWorkingTime(workingTime)}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!isCheckedIn ? (
              <Button 
                onClick={handleCheckIn} 
                className="flex-1 text-lg py-6"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                تسجيل حضور
              </Button>
            ) : (
              <Button 
                onClick={handleCheckOut} 
                variant="destructive" 
                className="flex-1 text-lg py-6"
                size="lg"
              >
                <LogOut className="h-5 w-5 mr-2" />
                تسجيل انصراف
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            تحديد يوم الإجازة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedVacationDay} onValueChange={setSelectedVacationDay}>
            <SelectTrigger>
              <SelectValue placeholder="اختر يوم الإجازة" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleVacationRequest} className="w-full">
            حفظ يوم الإجازة
          </Button>
        </CardContent>
      </Card>

      <Button 
        onClick={onLogout} 
        variant="outline" 
        className="w-full"
      >
        تسجيل خروج
      </Button>
    </div>
  );
};

export default DoctorDashboard;