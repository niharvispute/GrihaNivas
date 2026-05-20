'use client';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

import Image from 'next/image';

export default function ProfileHero({ user, onUpdate }) {
  const name = user?.name || 'Your Profile';
  const isVerified = user?.isVerified ?? false;
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const initials = getInitials(name);
  const joinedDate = user?.raw?.createdAt
    ? new Date(user.raw.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
        <div>
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/5 bg-gradient-to-br from-primary/10 via-white to-tertiary/60 flex items-center justify-center text-primary font-black text-lg sm:text-2xl flex-none">
            {avatarSrc ? (
              <Image
                alt={name}
                fill
                sizes="128px"
                className="object-cover"
                src={avatarSrc}
              />
            ) : (
              <span>{initials || 'U'}</span>
            )}
          </div>
        </div>
        <div className="text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-2">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight truncate">{name}</h2>
            {isVerified && (
              <span className="bg-emerald-50 text-emerald-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 flex items-center gap-1 border border-emerald-100 flex-none">
                <span className="material-symbols-outlined text-[10px] sm:text-xs">verified</span>
                <span className="hidden sm:inline">Verified Profile</span>
                <span className="sm:hidden">Verified</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-1.5 sm:gap-4 text-slate-400 text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">
            {joinedDate && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px] sm:text-sm">calendar_today</span>
                <span className="hidden sm:inline">Joined: {joinedDate}</span>
                <span className="sm:hidden">{joinedDate}</span>
              </span>
            )}
            {joinedDate && <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px] sm:text-sm">location_on</span>
              <span className="hidden sm:inline">Mumbai, IN</span>
              <span className="sm:hidden">Mumbai</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
