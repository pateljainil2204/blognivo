import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Signup() {
  const { user } = useAuth();
  
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-black text-white mb-6 group">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen size={24} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">BlogNivo</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-2">
            Join the Future <Sparkles className="text-indigo-400" size={24} />
          </h1>
          <p className="text-gray-400 font-medium px-4">Create your account and start writing with the power of AI.</p>
        </div>

        <div className="glass card-premium p-8 sm:p-10">
          <SignupForm />
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          Already a member?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}