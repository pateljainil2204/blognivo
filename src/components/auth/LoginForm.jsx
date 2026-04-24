import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Premium Input Component ───────────────────────────────────────────────
function FormInput({ id, type, label, value, onChange, icon: Icon, required, rightIcon: RightIcon, onRightIconClick }) {
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
          placeholder={`Enter your ${label.toLowerCase()}`}
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

// ─── Main Component ────────────────────────────────────────────────────────
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
      toast.success('Welcome back!');

      setTimeout(() => {
        setRedirecting(true);
      }, 1200);
    }
  };

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] animate-fade-in">
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">Redirecting to Dashboard</p>
            <p className="text-gray-400 text-sm mt-1">Getting things ready…</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/40 animate-bounce-once">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-black text-xl">Login Successful</p>
          <p className="text-gray-400 text-sm mt-1">Redirecting you now…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 flex flex-col shrink-0">
      {/* Email */}
      <FormInput
        id="login-email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        required
      />

      {/* Password */}
      <div className="space-y-1">
        <FormInput
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <div className="flex justify-end pr-1 pt-1">
          <Link
            to="/forgot-password"
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200"
          >
            Forgot password?
          </Link>
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
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">or</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      {/* Footer Text moved inside card */}
      <p className="text-center mt-2 text-sm text-gray-500 font-medium">
        Don't have an account?{' '}
        <Link to="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition-all">
          Create one
        </Link>
      </p>
    </form>
  );
}