export default function AdminHeader() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-lg group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all placeholder:text-slate-400" 
            placeholder="Search leads, properties, or transactions..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-white hover:shadow-xl transition-all group">
            <span className="material-symbols-outlined transition-transform group-hover:rotate-12">notifications</span>
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-slate-50"></span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-white hover:shadow-xl transition-all">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <div className="h-10 w-px bg-slate-100 mx-2"></div>
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 leading-none">Mumbai HQ</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">NARIMAN POINT</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-all">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy2tiNApv03nEZazvzuzSGmTWVgEvuRT8ObJ2iMtNC9YUUHL1NJnzq3QUbJGdj-qDNBiIQW0ImBBR8Ca8ydR-HQr1fGwhu8flkjzMV16KAzqhI1Q1gml0nIAVLyIskeehDX8q3AXZbP1IxuQZvr9rQQjHafSBMkm_Cc2ObohKM5XTGLppJt-5bMp7iJiyvs8KGH8UejePvVmhlMiZo_Q1viLqz_0Lwt4PD1vzJabmt6Gm8WsF60XtnbhY-UfLHBi9qywHVkILoiPU" 
              alt="HQ" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
