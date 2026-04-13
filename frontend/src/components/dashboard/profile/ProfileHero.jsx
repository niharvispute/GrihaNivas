'use client';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileHero({ user, onUpdate }) {
  const name = user?.name || 'Your Profile';
  const isVerified = user?.isVerified ?? false;
  const avatarSrc = user?.profilePictureUrl || user?.photoURL || user?.imageUrl || null;
  const initials = getInitials(name);
  const joinedDate = user?.raw?.createdAt
    ? new Date(user.raw.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <section className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/5 bg-linear-to-br from-primary/10 via-white to-tertiary/60 flex items-center justify-center text-primary font-black text-2xl">
            {avatarSrc ? (
              <img
                alt={name}
                className="w-full h-full object-cover"
                src={avatarSrc}
              />
            ) : (
              <span>{initials || 'U'}</span>
            )}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">{name}</h2>
            {isVerified && (
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 flex items-center gap-1 border border-emerald-100">
                <span className="material-symbols-outlined text-xs">verified</span>
                Verified Profile
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
            {joinedDate && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Joined: {joinedDate}
              </span>
            )}
            {joinedDate && <span className="w-1 h-1 bg-slate-300 rounded-full"></span>}
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Mumbai, IN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
