import { User, Shield, ShieldAlert, Award, MoreVertical, Loader2 } from 'lucide-react';

export default function AdminUserList({ users, loading, onUpdateRole }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Role</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{u.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'author' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {u.role === 'admin' ? <ShieldAlert size={12} /> :
                   u.role === 'author' ? <Award size={12} /> : <User size={12} />}
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onUpdateRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                    className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-purple-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                    title="Toggle Admin"
                  >
                    <Shield size={18} />
                  </button>
                  <button
                    onClick={() => onUpdateRole(u.id, u.role === 'author' ? 'user' : 'author')}
                    className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                    title="Toggle Author"
                  >
                    <Award size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}