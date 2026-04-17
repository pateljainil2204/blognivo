import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition text-white placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition text-white placeholder-gray-600"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-8 group text-base"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : (
          <>
            Sign In 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}