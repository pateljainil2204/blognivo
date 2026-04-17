import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to confirm registration!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition text-white placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition text-white placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition text-white placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Register As</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`py-2.5 rounded-xl border text-sm font-bold transition ${role === 'user' ? 'bg-indigo-600/50 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
          >
            Reader
          </button>
          <button
            type="button"
            onClick={() => setRole('author')}
            className={`py-2.5 rounded-xl border text-sm font-bold transition ${role === 'author' ? 'bg-indigo-600/50 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
          >
            Author
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6 group text-base"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : (
          <>
            Create Account 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}