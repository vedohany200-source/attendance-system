import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ref, onValue, off } from 'firebase/database';
import { database, doctors } from '@/lib/firebase';
import { Download, Share2, Users, Clock } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [vacationData, setVacationData] = useState<any>({});

  useEffect(() => {
    const attendanceRef = ref(database, 'attendance');
    const vacationRef = ref(database, 'vacations');
    
    const unsubscribeAttendance = onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAttendanceData(data);
    });

    const unsubscribeVacation = onValue(vacationRef, (snapshot) => {
      const data = snapshot.val() || {};
      setVacationData(data);
    });

    return () => {
      off(attendanceRef);
      off(vacationRef);
    };
  }, []);

  const getCurrentStatus = () => {
    const currentStatuses: any[] = [];
    
    Object.entries(doctors).forEach(([code, doctor]) => {
      if (code === 'RK36') return; // Skip admin
      
      const todayData = attendanceData[code]?.today;
      const isPresent = todayData?.checkIn && !todayData?.checkOut;
      
      currentStatuses.push({
        code,
        name: doctor.name,
        status: isPresent ? 'present' : 'absent',
        checkIn: todayData?.checkIn ? new Date(todayData.checkIn).toLocaleTimeString('ar-EG', { hour12: true }) : '-',
        workingTime: isPresent && todayData?.checkIn ? 
          calculateWorkingTime(new Date(todayData.checkIn), new Date()) : '-'
      });
    });

    return currentStatuses;
  };

  const calculateWorkingTime = (checkIn: Date, current: Date) => {
    const diff = Math.floor((current.getTime() - checkIn.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAttendanceHistory = () => {
    const history: any[] = [];
    
    Object.entries(attendanceData).forEach(([code, data]: [string, any]) => {
      if (code === 'RK36') return; // Skip admin
      
      const doctorName = doctors[code as keyof typeof doctors]?.name || 'غير معروف';
      
      // Today's data
      if (data.today) {
        history.push({
          ...data.today,
          doctorCode: code,
          doctorName
        });
      }
      
      // Historical data
      if (data.history) {
        Object.values(data.history).forEach((record: any) => {
          history.push({
            ...record,
            doctorCode: code,
            doctorName
          });
        });
      }
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const exportToPDF = () => {
    // This would implement PDF export functionality
    alert('سيتم إضافة وظيفة تصدير PDF قريباً');
  };

  const shareWhatsApp = () => {
    const currentStatuses = getCurrentStatus();
    const presentCount = currentStatuses.filter(s => s.status === 'present').length;
    const absentCount = currentStatuses.filter(s => s.status === 'absent').length;
    
    const message = `تقرير حضور صيدليات دكتور رامي كميل\n\n` +
                   `المتواجدين: ${presentCount}\n` +
                   `الغائبين: ${absentCount}\n\n` +
                   `التفاصيل:\n` +
                   currentStatuses.map(s => 
                     `${s.name}: ${s.status === 'present' ? '✅ متواجد' : '❌ غائب'}`
                   ).join('\n');
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const currentStatuses = getCurrentStatus();
  const attendanceHistory = getAttendanceHistory();
  const presentCount = currentStatuses.filter(s => s.status === 'present').length;
  const absentCount = currentStatuses.filter(s => s.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتواجدين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الغائبين</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدكاترة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(doctors).length - 1}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          تصدير PDF
        </Button>
        <Button onClick={shareWhatsApp} variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          مشاركة واتساب
        </Button>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">الحضور الحالي</TabsTrigger>
          <TabsTrigger value="history">سجل الحضور</TabsTrigger>
          <TabsTrigger value="vacations">الإجازات</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>حالة الحضور الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>وقت الحضور</TableHead>
                    <TableHead>وقت العمل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStatuses.map((status) => (
                    <TableRow key={status.code}>
                      <TableCell>{status.name}</TableCell>
                      <TableCell>
                        <Badge variant={status.status === 'present' ? 'default' : 'secondary'}>
                          {status.status === 'present' ? 'متواجد' : 'غائب'}
                        </Badge>
                      </TableCell>
                      <TableCell>{status.checkIn}</TableCell>
                      <TableCell>{status.workingTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور والانصراف</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>وقت الحضور</TableHead>
                    <TableHead>وقت الانصراف</TableHead>
                    <TableHead>ساعات العمل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>{record.doctorName}</TableCell>
                      <TableCell>
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour12: true }) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour12: true }) : 'لم ينصرف'}
                      </TableCell>
                      <TableCell>{record.workingHours || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacations">
          <Card>
            <CardHeader>
              <CardTitle>أيام الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>يوم الإجازة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(vacationData).map(([code, vacation]: [string, any]) => (
                    <TableRow key={code}>
                      <TableCell>{vacation.doctorName}</TableCell>
                      <TableCell>
                        {vacation.day === 'sunday' && 'الأحد'}
                        {vacation.day === 'monday' && 'الإثنين'}
                        {vacation.day === 'tuesday' && 'الثلاثاء'}
                        {vacation.day === 'wednesday' && 'الأربعاء'}
                        {vacation.day === 'thursday' && 'الخميس'}
                        {vacation.day === 'friday' && 'الجمعة'}
                        {vacation.day === 'saturday' && 'السبت'}
                      </TableCell>
                      <TableCell>
                        {new Date(vacation.requestDate).toLocaleDateString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={onLogout} variant="outline" className="w-full">
        تسجيل خروج
      </Button>
    </div>
  );
};

export default AdminDashboard;