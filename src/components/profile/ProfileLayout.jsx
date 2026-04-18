import React from 'react';
import { Shield, Award, Calendar, User } from 'lucide-react';

export default function ProfileLayout({ profile, stats, children, actionButton }) {
  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* 1. Cover Banner & Profile Info */}
      <div className="relative mb-24 md:mb-32">
        <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 overflow-hidden relative shadow-[0_0_40px_rgba(79,70,229,0.2)] border border-white/5">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 mix-blend-multiply"></div>
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Profile Info overlaying banner */}
        <div className="absolute -bottom-16 md:-bottom-24 left-4 md:left-12 flex flex-col md:flex-row items-center md:items-end gap-6 w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] px-2">
          
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-slate-950 relative z-10 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                : profile.name?.[0]?.toUpperCase()
              }
            </div>
          </div>
          
          <div className="flex-1 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-4 text-center md:text-left w-full mt-2 md:mt-0">
            <div>
               <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">{profile.name}</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 {profile.role === 'admin' && (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                     <Shield size={12} /> Admin
                   </span>
                 )}
                 {profile.role === 'author' && (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                     <Award size={12} /> Author
                   </span>
                 )}
                 <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold tracking-widest uppercase bg-white/5 border border-white/5 px-3 py-1 rounded-full backdrop-blur-md">
                   <Calendar size={12} /> Joined {profile.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                 </div>
               </div>
            </div>
             
            {/* Action Button slot */}
            <div className="shrink-0 flex items-center justify-center">
              {actionButton}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="px-4 md:px-12 mb-12 text-center md:text-left mt-[110px] md:mt-0 relative z-10">
        <p className="text-base md:text-lg text-gray-300 max-w-3xl leading-relaxed">
          {profile.bio || `Welcome to your profile, ${profile.name}.`}
        </p>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-12 mb-16 relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className={`glass p-6 rounded-3xl border border-white/10 shadow-lg transition-all hover:-translate-y-1 group bg-gradient-to-br from-slate-900 to-slate-900/50 text-center ${stat.borderColor || 'hover:border-indigo-500/30'}`}>
            <p className={`text-4xl font-black text-white tracking-tight transition-colors drop-shadow-sm ${stat.hoverColor || 'group-hover:text-indigo-400'}`}>{stat.value}</p>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
              {stat.icon && <stat.icon size={14} className={`${stat.iconColor || 'text-indigo-500/50'}`} />} 
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Main Content Content Container */}
      <div className="px-4 md:px-12 relative z-10">
        {children}
      </div>
    </div>
  );
}
