// specorbit-frontend/src/pages/TeamSettings.tsx
import { Users, Mail, ShieldCheck, Plus } from 'lucide-react';

export default function TeamSettings() {
  const members = [
    { name: 'Ravi cypher', email: 'ravi@specorbit.com', role: 'Admin' },
    { name: 'AI Assistant', email: 'ai@specorbit.com', role: 'Developer' },
  ];

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 font-medium">Manage collaborators and permissions</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
          <Plus size={18} /> Invite Member
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.email} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <ShieldCheck size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}