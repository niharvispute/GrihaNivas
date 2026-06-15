'use client';

import { useRef, useState } from 'react';
import { bulkImportUnits } from '@/services/projectService';

const EXPECTED_HEADERS = [
  'configurationId', 'tower', 'block', 'floor', 'unitNumber',
  'carpetArea', 'builtupArea', 'facing', 'viewType', 'price', 'status', 'notes',
];

const NUMERIC_FIELDS = new Set(['floor', 'carpetArea', 'builtupArea', 'price']);

/**
 * Minimal CSV parser (handles quoted fields and commas inside quotes).
 * XLSX is intentionally not parsed client-side in Phase 1 — that arrives in
 * Phase 3 via the dedicated file-upload endpoint (P3-3c). CSV only for now.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function rowsToUnits(rows) {
  if (!rows.length) return { units: [], errors: ['File is empty'] };
  const header = rows[0].map((h) => h.trim());
  const units = [];
  const errors = [];
  for (let r = 1; r < rows.length; r += 1) {
    const cells = rows[r];
    if (cells.every((c) => c.trim() === '')) continue;
    const obj = {};
    header.forEach((key, idx) => {
      if (!EXPECTED_HEADERS.includes(key)) return;
      let val = (cells[idx] ?? '').trim();
      if (val === '') return;
      if (NUMERIC_FIELDS.has(key)) {
        const n = Number(val);
        if (Number.isNaN(n)) { errors.push(`Row ${r + 1}: "${key}" must be a number`); return; }
        obj[key] = n;
      } else {
        obj[key] = val;
      }
    });
    if (!obj.configurationId) {
      errors.push(`Row ${r + 1}: configurationId is required`);
      continue;
    }
    units.push(obj);
  }
  return { units, errors };
}

export default function BulkImportPanel({ projectId, onImported }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null); // { inserted, failed, errors[] }
  const [parseErrors, setParseErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setMessage('Only CSV and XLSX files are supported');
      return;
    }
    if (ext !== 'csv') {
      setMessage('XLSX import arrives in Phase 3 — please use CSV for now.');
    } else {
      setMessage(null);
    }
    setSelectedFile(file);
    setResult(null);
    setParseErrors([]);
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
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'csv') { setMessage('XLSX import arrives in Phase 3 — please use CSV.'); return; }

    setBusy(true);
    setMessage(null);
    try {
      const text = await selectedFile.text();
      const { units, errors } = rowsToUnits(parseCsv(text));
      setParseErrors(errors);
      if (!units.length) {
        setMessage('No valid rows found to import.');
        setBusy(false);
        return;
      }
      const res = await bulkImportUnits(projectId, units);
      setResult({
        inserted: res?.inserted ?? units.length,
        failed: res?.failed ?? 0,
        errors: res?.errors || [],
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
          <p className="text-xs text-slate-400 mt-0.5">Import units from CSV · Max 500 units per import</p>
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
            <p className="text-xs text-slate-400">CSV files (XLSX in Phase 3)</p>
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

      {(parseErrors.length > 0 || (result?.errors?.length > 0)) && (
        <div className="mt-3 max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 space-y-1">
          {parseErrors.map((e, i) => <p key={`p${i}`}>{e}</p>)}
          {(result?.errors || []).map((e, i) => (
            <p key={`s${i}`}>{typeof e === 'string' ? e : JSON.stringify(e)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
