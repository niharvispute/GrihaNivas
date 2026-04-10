export default function PropertyGallery({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl relative group">
        <img 
          src={images[0]} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Main Property Image" 
        />
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm">Ready to Move</span>
          <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">RERA Approved</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 h-32">
        {images.slice(1, 5).map((img, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-all border border-slate-100 relative group">
            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Property thumb ${idx + 2}`} />
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 4} More</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
