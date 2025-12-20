import { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  CreditCard, 
  Save, 
  Github,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="p-10 max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal information and security.</p>
      </header>

      <div className="space-y-8">
        {/* Personal Information Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <UserIcon size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Personal Information</h3>
            </div>
          </div>
          
          <div className="p-10 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  defaultValue={user?.name || ''}
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  disabled
                  defaultValue={user?.email || ''}
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-100 border-none rounded-2xl text-sm text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security & Password Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Security</h3>
          </div>
          
          <div className="p-10 space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4">
                <Github className="w-6 h-6 text-slate-900" />
                <div>
                  <p className="text-sm font-bold text-slate-900">GitHub Authentication</p>
                  <p className="text-xs text-slate-500">Connected to GitHub account: {user?.githubId || 'Not linked'}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200">Connected</span>
            </div>

            <button className="w-full py-4 text-sm font-bold text-indigo-600 border-2 border-dashed border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-colors">
              Change Password
            </button>
          </div>
        </section>

        {/* Subscription Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Billing & Subscription</h3>
          </div>
          
          <div className="p-10">
            <div className="flex items-center justify-between p-8 bg-indigo-900 rounded-[2rem] text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Current Plan</p>
                <h4 className="text-2xl font-black mb-4 capitalize">{user?.subscription || 'Starter'}</h4>
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <CheckCircle2 size={16} /> 15/20 Projects remaining
                </div>
              </div>
              <button className="relative z-10 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                Upgrade Plan
              </button>
              {/* Background accent */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-rose-50 rounded-[2.5rem] border border-rose-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Delete Account</p>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Permanently delete your profile and all associated API specifications. This action is irreversible.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all">
            Delete Permanently
          </button>
        </section>

        {/* Floating Save Button */}
        <div className="sticky bottom-8 flex justify-end">
          <button 
            onClick={() => setIsSaving(true)}
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}