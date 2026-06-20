'use client';

import { useRef, useState } from 'react';
import { bulkImportUnitsFromFile, downloadBulkImportTemplate } from '@/services/projectService';

export default function BulkImportPanel({ projectId, onImported }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null); // { total, inserted, failed, errors[] }
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setMessage('Only CSV and XLSX files are supported');
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setMessage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    if (!projectId) { setMessage('Save earlier steps first so the project exists.'); return; }

    setBusy(true);
    setMessage(null);
    try {
      const res = await bulkImportUnitsFromFile(projectId, selectedFile);
      setResult({
        total: res?.total ?? 0,
        inserted: res?.inserted ?? 0,
        failed: res?.failed ?? 0,
        errors: res?.errors || [],
        warning: res?.warning || null,
      });
      onImported?.();
    } catch (err) {
      setMessage(err?.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-700">Bulk Import Units</h4>
          <p className="text-xs text-slate-400 mt-0.5">Import units from CSV or XLSX · Max 500 units per import</p>
        </div>
        <button
          onClick={() => projectId && downloadBulkImportTemplate(projectId)}
          disabled={!projectId}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Download Template
        </button>
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
            <p className="text-xs text-slate-400">CSV or XLSX · Max 5 MB</p>
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

      {message && (
        <p className="mt-2 text-xs text-amber-600">{message}</p>
      )}

      {selectedFile && (
        <button
          onClick={handleImport}
          disabled={busy}
          className="mt-3 w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {busy ? 'Importing…' : 'Import Units'}
        </button>
      )}

      {/* Validation summary */}
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
            <p className="text-xs font-semibold text-green-700 mt-0.5">Inserted</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            <p className="text-xs font-semibold text-red-700 mt-0.5">Failed</p>
          </div>
        </div>
      )}

      {result?.warning && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          {result.warning}
        </div>
      )}

      {result?.errors?.length > 0 && (
        <div className="mt-3 max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 space-y-1">
          {result.errors.map((e, i) => (
            <p key={i}>{typeof e === 'string' ? e : (e.message || JSON.stringify(e))}</p>
          ))}
        </div>
      )}
    </div>
  );
}
