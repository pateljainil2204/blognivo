import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import AuthCreativePanel from '../components/auth/AuthCreativePanel';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Signup() {
  const { user } = useAuth();
  
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950">
      {/* Left Side: Creative Panel */}
      <AuthCreativePanel />

      {/* Right Side: Form Section */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-md w-full relative z-10">
          {/* Logo (Mobile Only) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-white group">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <BookOpen size={20} />
              </div>
              <span>BlogNivo</span>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3 flex items-center justify-center lg:justify-start gap-3">
              Join the Future <Sparkles className="text-indigo-400 shrink-0" size={28} />
            </h1>
            <p className="text-gray-400 font-medium">Create your account and start writing today.</p>
          </div>

          <div className="glass bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-2xl">
            <SignupForm />
          </div>

          <p className="text-center mt-10 text-sm text-gray-500 font-medium">
            Already a member?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-all underline-offset-4 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}