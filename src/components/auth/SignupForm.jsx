import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Floating Label Input ──────────────────────────────────────────────────
function FloatingInput({ id, type, label, value, onChange, icon: Icon, required }) {
  return (
    <div className="relative group">
      {/* Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-300 pointer-events-none">
        <Icon size={18} />
      </div>

      {/* Input */}
      <input
        id={id}
        type={type}
        required={required}
        placeholder=" "
        value={value}
        onChange={onChange}
        className="
          peer w-full bg-white/5 border border-white/10 rounded-xl
          px-4 pt-5 pb-2.5 pl-12
          focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
          focus:scale-[1.01] focus:shadow-lg focus:shadow-indigo-500/10
          outline-none transition-all duration-300 ease-in-out
          text-white placeholder-transparent
          text-sm
        "
      />

      {/* Floating Label */}
      <label
        htmlFor={id}
        className="
          absolute left-12 top-3.5
          text-gray-400 text-sm
          transition-all duration-300 ease-in-out
          pointer-events-none
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500
          peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-400 peer-focus:font-bold peer-focus:tracking-wide
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-indigo-400/70 peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:tracking-wide
        "
      >
        {label}
      </label>
    </div>
  );
}

// ─── Role Card ──────────────────────────────────────────────────────────────
const ROLES = [
  {
    key: 'user',
    icon: '👤',
    title: 'Reader',
    desc: 'Explore & discover',
  },
  {
    key: 'author',
    icon: '✍️',
    title: 'Author',
    desc: 'Write & publish',
  },
];

function RoleCard({ role, value, selectedRole, onSelect }) {
  const isSelected = selectedRole === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={isSelected}
      className={`
        relative flex flex-col items-center justify-center gap-1.5
        border rounded-xl p-4 cursor-pointer
        transition-all duration-300 ease-in-out
        hover:scale-[1.03] hover:shadow-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        ${isSelected
          ? 'border-indigo-500 bg-indigo-500/20 scale-[1.04] shadow-lg shadow-indigo-500/20 text-white'
          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white hover:shadow-indigo-500/10'
        }
      `}
    >
      {/* Selection ring pulse */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/60 animate-ping-once pointer-events-none" />
      )}

      <span className="text-2xl leading-none">{role.icon}</span>
      <span className="text-sm font-black tracking-tight">{role.title}</span>
      <span className={`text-[10px] font-medium transition-colors duration-300 ${isSelected ? 'text-indigo-300' : 'text-gray-600'}`}>
        {role.desc}
      </span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, name, role);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
      toast.success('Check your email to confirm registration!');
    }
  };

  // ── Success Feedback ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-5 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/40">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-black text-xl">Account Created!</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
            A confirmation link has been sent to{' '}
            <span className="text-indigo-400 font-bold">{email}</span>.
            Check your inbox to get started.
          </p>
        </div>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 transition-all duration-500 ease-in-out"
    >
      {/* Full Name */}
      <FloatingInput
        id="signup-name"
        type="text"
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={User}
        required
      />

      {/* Email */}
      <FloatingInput
        id="signup-email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        required
      />

      {/* Password */}
      <FloatingInput
        id="signup-password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        required
      />

      {/* Role Selection */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
          Register As
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <RoleCard
              key={r.key}
              role={r}
              value={r.key}
              selectedRole={role}
              onSelect={setRole}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-gradient-to-r from-indigo-500 to-purple-500
          text-white font-bold py-3.5 rounded-xl
          shadow-lg shadow-indigo-500/20
          hover:shadow-indigo-500/40 hover:scale-[1.02]
          active:scale-[0.97]
          transition-all duration-300 ease-in-out
          flex items-center justify-center gap-2 group
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          mt-2
        "
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Creating account…</span>
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#0f172a] px-3 font-bold text-gray-500 tracking-widest">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        className="
          w-full bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]
          active:scale-[0.98]
          text-white font-bold py-2.5 rounded-xl
          transition-all duration-300 ease-in-out
          flex items-center justify-center gap-3 group text-sm
        "
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google Account
      </button>
    </form>
  );
}