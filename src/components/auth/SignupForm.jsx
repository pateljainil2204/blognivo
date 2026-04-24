import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle, Eye, EyeOff, BookOpen, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

// ─── Premium Input Component ───────────────────────────────────────────────
function FormInput({ id, type, label, value, onChange, icon: Icon, required, rightIcon: RightIcon, onRightIconClick, placeholder }) {
  return (
    <div className="space-y-1 shrink-0">
      <label htmlFor={id} className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300 pointer-events-none">
          <Icon size={18} />
        </div>

        {/* Input */}
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="
            w-full h-10 bg-white/5 border border-white/10 rounded-lg
            px-4 pl-12 pr-12
            focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500
            outline-none transition-all duration-300
            text-white placeholder-gray-600
            text-sm font-medium
          "
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
        />

        {/* Right Icon (Toggle Password) */}
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-white transition-colors duration-300"
          >
            <RightIcon size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Role Card ──────────────────────────────────────────────────────────────
const ROLES = [
  {
    key: 'user',
    icon: BookOpen,
    title: 'Reader',
    desc: 'Explore & discover',
  },
  {
    key: 'author',
    icon: PenTool,
    title: 'Author',
    desc: 'Write & publish',
  },
];

function RoleCard({ role, selectedRole, onSelect }) {
  const isSelected = selectedRole === role.key;
  const Icon = role.icon;
  
  return (
    <button
      type="button"
      onClick={() => onSelect(role.key)}
      className={`
        relative flex flex-col items-center justify-center p-2 gap-1
        border rounded-xl transition-all duration-300 group
        ${isSelected 
          ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }
      `}
    >
      <div className={`p-2 rounded-lg transition-colors duration-300 ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>
        <Icon size={20} />
      </div>
      <div className="text-center">
        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{role.title}</p>
        <p className="text-[10px] text-gray-500 font-medium">{role.desc}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name, role);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      // Notify Admins
      try {
        const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
        if (admins) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            message: `New ${role} registered: ${name}`,
            type: 'info'
          }));
          await supabase.from('notifications').insert(adminNotifications);
        }
      } catch (err) {
        console.error('Failed to notify admins of signup:', err);
      }

      setLoading(false);
      setSuccess(true);
      toast.success('Check your email to confirm registration!');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-5 animate-scale-in text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/40">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-black text-xl">Account Created!</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
            A confirmation link has been sent to <span className="text-purple-400 font-bold">{email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 flex flex-col shrink-0">
      {/* Full Name */}
      <FormInput
        id="signup-name"
        type="text"
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={User}
        required
        placeholder="Your name"
      />

      {/* Email */}
      <FormInput
        id="signup-email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        required
        placeholder="name@example.com"
      />

      {/* Password */}
      <FormInput
        id="signup-password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        required
        rightIcon={showPassword ? EyeOff : Eye}
        onRightIconClick={() => setShowPassword(!showPassword)}
        placeholder="Min. 8 characters"
      />

      {/* Confirm Password */}
      <FormInput
        id="signup-confirm-password"
        type={showPassword ? 'text' : 'password'}
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon={Lock}
        required
        placeholder="Repeat password"
      />

      {/* Role Selection */}
      <div className="space-y-1 shrink-0">
        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          Register As
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <RoleCard
              key={r.key}
              role={r}
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
          w-full h-11 bg-gradient-to-r from-purple-600 to-violet-600
          text-white text-sm font-bold rounded-xl
          shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50 hover:scale-105
          active:scale-[0.98]
          transition-all duration-300
          flex items-center justify-center gap-2 group
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          mt-3
        "
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* Terms Footer */}
      <p className="text-[10px] text-center text-gray-600 font-medium mt-2">
        By signing up you agree to our <Link to="/terms" className="text-gray-400 hover:text-white underline">Terms</Link> and <Link to="/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</Link>.
      </p>

      {/* Footer Text */}
      <p className="text-center mt-3 text-sm text-gray-500 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-all">
          Sign in
        </Link>
      </p>
    </form>
  );
}