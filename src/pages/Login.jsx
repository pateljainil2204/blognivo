import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import AuthCreativePanel from '../components/auth/AuthCreativePanel';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" />;

  return (
    <div className="h-screen w-full flex bg-[#020617] overflow-hidden">
      {/* Left Side: Creative Panel - 60% */}
      <div className="hidden lg:flex w-[60%] h-full border-r border-white/5 bg-[#020617]">
        <AuthCreativePanel />
      </div>

      {/* Right Side: Form Section - 40% */}
      <div className="w-full lg:w-[40%] h-full flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-sm w-full relative z-10 flex flex-col">
          
          {/* Top Toggle (Pill Switch) */}
          <div className="w-full flex bg-white/5 p-1 rounded-full mb-6 border border-white/10 backdrop-blur-md shrink-0">
            <Link to="/login" className="flex-1 py-2 text-sm font-bold text-white bg-purple-600 rounded-full text-center shadow-md transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-gray-200 rounded-full text-center transition-colors">
              Create Account
            </Link>
          </div>

          {/* Main Auth Card */}
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl shadow-purple-500/10 flex flex-col shrink-0">

            {/* Header Section inside Card */}
            <div className="text-center mb-4 w-full shrink-0">
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl scale-150"></div>
                  <div className="relative w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center shadow-inner">
                    <ShieldCheck size={20} className="text-purple-400" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-xl font-bold text-white tracking-tight mb-1">Welcome Back!</h1>
              <p className="text-xs text-gray-400 font-medium">Continue your journey.</p>
            </div>

          <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}