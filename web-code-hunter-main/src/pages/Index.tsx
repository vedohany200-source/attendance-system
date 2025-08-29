import { useState } from 'react';
import DigitalClock from '@/components/DigitalClock';
import LoginForm from '@/components/LoginForm';
import DoctorDashboard from '@/components/DoctorDashboard';
import AdminDashboard from '@/components/AdminDashboard';
// import pharmacyLogo from '@/assets/pharmacy-logo.png';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<{code: string, data: any} | null>(null);

  const handleLogin = (doctorCode: string, doctor: any) => {
    setCurrentUser({ code: doctorCode, data: doctor });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/883da7fc-dfbe-4490-ad90-f176e6da2452.png" 
              alt="Ramy Kamil Pharmacy Logo" 
              className="h-20 w-20 object-contain"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              صيدليات دكتور رامي كميل
            </h1>
          </div>
          <DigitalClock />
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {!currentUser ? (
            <LoginForm onLogin={handleLogin} />
          ) : currentUser.data.isAdmin ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <DoctorDashboard
              doctorCode={currentUser.code}
              doctorName={currentUser.data.name}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-black">
            POWERED BY FADY
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
