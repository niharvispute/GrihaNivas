export default function EmptyState({ 
  title = "No results found", 
  message = "Try adjusting your filters or search terms to find what you're looking for.",
  icon = "search",
  onAction,
  actionLabel = "Clear filters"
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white rounded-moderate border border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
        {icon === 'search' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
        {message}
      </p>
      {onAction && (
        <button 
          onClick={onAction}
          className="bg-primary text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
