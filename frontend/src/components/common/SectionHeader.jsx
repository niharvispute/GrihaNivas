export default function SectionHeader({ title, subtitle, align = 'left', className = "" }) {
  const alignment = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  return (
    <div className={`${alignment[align] || alignment.left} ${className} max-w-2xl mb-12`}>
      <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-slate-600 leading-relaxed font-bold">
          {subtitle}
        </p>
      )}
    </div>
  );
}
