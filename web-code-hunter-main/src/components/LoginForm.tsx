import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doctors } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (doctorCode: string, doctor: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "خطأ",
        description: "من فضلك أدخل الكود",
        variant: "destructive"
      });
      return;
    }

    const doctor = doctors[code as keyof typeof doctors];
    if (!doctor) {
      toast({
        title: "خطأ",
        description: "الكود غير صحيح",
        variant: "destructive"
      });
      return;
    }

    onLogin(code, doctor);
    toast({
      title: "تم بنجاح",
      description: `مرحباً ${doctor.name}`,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="أدخل الكود الخاص بك"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-lg"
              maxLength={4}
            />
          </div>
          <Button type="submit" className="w-full text-lg py-6">
            دخول
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;