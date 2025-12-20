import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { Github, ArrowRight, Sparkles, User, Mail, Lock } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-xl mb-4 ring-1 ring-slate-200">
             <Sparkles className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium mt-2">Join developers automating their API docs</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-950/5 border border-slate-200/60">
          <button
            onClick={() => window.location.href = 'http://localhost:3000/api/auth/github'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 text-sm font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 transition-all"
          >
            <Github className="w-5 h-5" /> Continue with GitHub
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="px-3 bg-white">OR REGISTER WITH EMAIL</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? 'Creating...' : 'Start Building'} <ArrowRight size={18} strokeWidth={3} />
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Already a user? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}