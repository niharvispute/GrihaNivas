'use client';

import { useRef, useState } from 'react';

export default function FileUploadZone({
  accept = 'image/*',
  maxSizeMB = 5,
  multiple = false,
  onFilesChange,
  label = 'Upload File',
  hint,
  previewUrls = [],       // [{ url: string, name?: string, isImage?: boolean }]
  onRemove,               // (index) => void
  className = '',
  compact = false,        // square tile with just an icon, for use inside image grids
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateAndEmit = (files) => {
    setError('');
    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid = [];
    const errs = [];

    Array.from(files).forEach((f) => {
      if (f.size > maxBytes) {
        errs.push(`${f.name} exceeds ${maxSizeMB}MB`);
      } else {
        valid.push(f);
      }
    });

    if (errs.length) setError(errs.join('; '));
    if (valid.length) onFilesChange?.(valid);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndEmit(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (e.target.files?.length) validateAndEmit(e.target.files);
    e.target.value = '';
  };

  const isImageAccept = accept.includes('image');

  if (compact) {
    return (
      <div className={className}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          title={label}
          className={`w-full h-full aspect-square flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-2xl text-slate-400">add</span>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Previews */}
      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {previewUrls.map((item, i) => (
            <div key={i} className="relative group">
              {item.isImage !== false && isImageAccept ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 px-2">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">description</span>
                  <p className="text-xs text-slate-500 text-center truncate w-full">{item.name || 'file'}</p>
                </div>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>close</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
        }`}
      >
        <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-xs text-slate-400">
          {hint || `Drag & drop or click to browse · Max ${maxSizeMB}MB`}
        </p>
        <button
          type="button"
          className="mt-1 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Choose {multiple ? 'Files' : 'File'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
