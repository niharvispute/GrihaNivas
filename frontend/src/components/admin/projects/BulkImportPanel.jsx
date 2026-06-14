'use client';

import { useRef, useState } from 'react';

export default function BulkImportPanel({ onImport }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null); // { ready, duplicates, errors }

  const handleFile = (file) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      alert('Only CSV and XLSX files are supported');
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePreview = () => {
    if (!selectedFile) return;
    // Phase 0: mock result — Phase 1 wires real parsing
    setResult({ ready: 120, duplicates: 4, errors: 2 });
    onImport?.({ file: selectedFile, preview: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-700">Bulk Import Units</h4>
          <p className="text-xs text-slate-400 mt-0.5">Import units from CSV or XLSX · Max 500 units per import</p>
        </div>
        <a
          href="/templates/unit-import-template.csv"
          download
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Download Template
        </a>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
        }`}
      >
        {selectedFile ? (
          <>
            <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
            <p className="text-sm font-semibold text-slate-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-3xl text-slate-400">upload_file</span>
            <p className="text-sm font-semibold text-slate-600">Drag &amp; drop file here or click to browse</p>
            <p className="text-xs text-slate-400">CSV, XLSX files only</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
      />

      {selectedFile && (
        <button
          onClick={handlePreview}
          className="mt-3 w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Preview Import
        </button>
      )}

      {/* Validation summary */}
      {result && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{result.ready}</p>
            <p className="text-xs font-semibold text-green-700 mt-0.5">Ready</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{result.duplicates}</p>
            <p className="text-xs font-semibold text-amber-700 mt-0.5">Duplicates</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{result.errors}</p>
            <p className="text-xs font-semibold text-red-700 mt-0.5">Errors</p>
          </div>
        </div>
      )}
    </div>
  );
}
