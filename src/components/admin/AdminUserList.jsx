import { User, Shield, ShieldAlert, Award, MoreVertical, Loader2 } from 'lucide-react';

export default function AdminUserList({ users, loading, onUpdateRole }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg shadow-indigo-500/5">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-white/10 backdrop-blur-md">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">User Details</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Current Role</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-sm border border-white/20">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">{u.name}</p>
                    <p className="text-xs text-gray-500 font-medium font-mono">{u.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  u.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  u.role === 'author' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/10 text-gray-300 border-white/10'
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
                    className="p-2.5 rounded-xl text-gray-500 hover:bg-white/10 hover:text-red-400 hover:shadow-sm border border-transparent hover:border-white/10 transition-all bg-white/5"
                    title="Toggle Admin"
                  >
                    <Shield size={18} />
                  </button>
                  <button
                    onClick={() => onUpdateRole(u.id, u.role === 'author' ? 'user' : 'author')}
                    className="p-2.5 rounded-xl text-gray-500 hover:bg-white/10 hover:text-indigo-400 hover:shadow-sm border border-transparent hover:border-white/10 transition-all bg-white/5"
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