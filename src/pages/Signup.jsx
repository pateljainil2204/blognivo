import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Signup() {
  const { user } = useAuth();
  
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-black text-blue-600 mb-6 group">
            <div className="p-2 bg-blue-600 text-white rounded-xl group-hover:rotate-6 transition-transform">
              <BookOpen size={24} />
            </div>
            BlogNivo
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center gap-2">
            Join the Future <Sparkles className="text-blue-500" size={24} />
          </h1>
          <p className="text-slate-500 font-medium px-4">Create your account and start writing with the power of AI.</p>
        </div>

        <div className="card-premium p-8 shadow-2xl shadow-blue-500/5">
          <SignupForm />
        </div>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Already a member?{' '}
          <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}