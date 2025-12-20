import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { Github, ArrowRight, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPassword(email, password);
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError('Check credentials and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />

      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-6 ring-1 ring-slate-200">
             <Shield className="w-8 h-8 text-indigo-600 fill-indigo-50" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SpecOrbit</h1>
          <p className="text-slate-500 font-medium mt-2">Login to your developer dashboard</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-950/5 border border-slate-200/60 backdrop-blur-sm">
          <button
            onClick={() => window.location.href = 'http://localhost:3000/api/auth/github'}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-slate-200 text-sm font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 transition-all hover:border-slate-300"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="px-3 bg-white">Or use email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
            
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} strokeWidth={3} />
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          New here? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}