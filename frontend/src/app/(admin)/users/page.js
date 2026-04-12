'use client';

import { useState } from 'react';

export default function UserManagementPage() {
  const users = [
    { name: "Ananya Sharma", email: "ananya.s@outlook.com", phone: "+91 98765 43210", joined: "Oct 12, 2024", enquiries: 14, lastActive: "2 hours ago", status: "Active", statusColor: "bg-emerald-50 text-emerald-700", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhq0nRf3COntWPCmTOdKno4PB52Arvvn48KuCXkutanWKK4P80fHlWquXpLhBMJaVlD0GWi3DfVklc3rtaD4kZTMGmHjvux_vZ6alw-GxvQi9cCTXfjNTKDvdN3Oz5EJ2zOJLux7kVLoWv0Wjwdks05WMK94OXusEzUMnSLFiABomN5ZrnCP1djdpPOAOt_6C7AY8aNBd3vHHuXbpJfOgrCdi6xr9NmvsFuj49re8y-vALrkxf-7qy8zuz277aAlSX3k46M-gPfT4" },
    { name: "Vikram Malhotra", email: "v.malhotra@gmail.com", phone: "+91 91234 56789", joined: "Sep 28, 2024", enquiries: 8, lastActive: "Yesterday", status: "Inactive", statusColor: "bg-slate-100 text-slate-500", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbAY5Mpk7F4GXqwA4w6Fa-2siUPXTkOZ_a5_4I7O9j4sCAvFXHA0KZWG-BzeBv7WdOGD5OFWVS5JL4jNgsQorL4qLMXJM0iDHP4lO5WppFFfQja33Gb4vXzbi8QvSywImEijxsBr6bGpusrz2gvI0QHqGto2ADjXxIkK-jN3mjylpXjkEYZh5J0hQEZDzuKQlREDFNgZwD-hXDNk8RKHB97TFzkVZzNMjt7kFvN2IuXymdk9N_rXjpILqYQXbwljV2ylSIYcs6FLA" },
    { name: "Priya Kapur", email: "priyakapur@icloud.com", phone: "+91 99887 76655", joined: "Nov 02, 2024", enquiries: 21, lastActive: "Just now", status: "Active", statusColor: "bg-emerald-50 text-emerald-700", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvHaOxJiuZx1K_WWiJloxgEcrjEvgYe-QVFbB9GUOpH8Xl5sbBaTm8DIN--DLeFW14vuDjeyCWNhjEXieWaE44k7-bswbd01Mz1lEhEc6nJWgIyS4RTkdJP9C8nJ0fGPRVUKxLvXa7EBnTVGh_-10rSYcfbEn6LC2lII-Diq0n_PMHOT6Yut9UIB2RuQgFdBK-WNkr_6tHudDBHDOYIyC6ecWjkNWOiH-874Oj1Q6ybJWcB-Il9WuS_bFK2X-g7runlkZlmvd15K0" },
    { name: "Rohan Singh", email: "rohan.singh@corporate.in", phone: "+91 77665 44332", joined: "Oct 30, 2024", enquiries: 2, lastActive: "3 days ago", status: "Pending", statusColor: "bg-amber-50 text-amber-700", avatar: null, initials: "RS" }
  ];

  const stats = [
    { label: "Monthly Growth", value: "+12.4%", icon: "trending_up", color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Verified Users", value: "89%", icon: "verified_user", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "New Enquiries", value: "42", icon: "mark_email_unread", color: "text-blue-600", bg: "bg-blue-50" }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 📋 Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Users</h1>
          <p className="text-slate-500 font-bold mt-2">Manage and monitor the Mumbai Editorial community engagement.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export
          </button>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all active:scale-95 shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Invite User
          </button>
        </div>
      </div>

      {/* 🔍 User Management Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden hover:shadow-2xl transition-all">
        <div className="overflow-x-auto px-6 pb-6 mt-6">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Contact specifics</th>
                <th className="px-6 py-4">Enrollment date</th>
                <th className="px-6 py-4 text-center">Inquiry load</th>
                <th className="px-6 py-4">Last activity</th>
                <th className="px-6 py-4 text-center">Status lifecycle</th>
                <th className="px-6 py-4 text-right">Console</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {users.map((user, i) => (
                <tr key={i} className="bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group rounded-3xl">
                  <td className="px-6 py-6 rounded-l-3xl">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:rotate-6 transition-transform" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-sm">
                          {user.initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-500">{user.phone}</td>
                  <td className="px-6 py-6 text-sm font-black text-slate-900 tracking-tight italic">{user.joined}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-white px-3 py-1.5 rounded-lg font-black text-xs text-slate-600 shadow-sm border border-slate-50">{user.enquiries}</span>
                  </td>
                  <td className="px-6 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{user.lastActive}</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${user.statusColor}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right rounded-r-3xl">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 4 of 124 community members</span>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-primary bg-primary text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🍱 Engagement Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all group">
            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter italic">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
