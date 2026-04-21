'use strict';

/**
 * Static codebase scanner for performance optimization opportunities.
 * Reads source files (never modifies them).
 * Returns an array of optimization findings.
 */

const fs   = require('fs');
const path = require('path');

const BACKEND_DIR  = path.join(__dirname, '..', '..', 'backend');
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function readDir(dir, ext = '.js', visited = new Set()) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', '.next', 'build', 'dist'].includes(entry.name)) {
      results.push(...readDir(full, ext, visited));
    } else if (entry.isFile() && (entry.name.endsWith(ext) || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      if (!visited.has(full)) {
        visited.add(full);
        results.push(full);
      }
    }
  }
  return results;
}

function relPath(p) {
  return p.replace(path.join(__dirname, '..', '..'), '').replace(/\\/g, '/');
}

function scan() {
  const findings = [];

  const backendFiles  = readDir(path.join(BACKEND_DIR, 'controllers'))
    .concat(readDir(path.join(BACKEND_DIR, 'routes')))
    .concat(readDir(path.join(BACKEND_DIR, 'services')));

  const frontendFiles = readDir(path.join(FRONTEND_DIR, 'src'));

  // ── Backend: .find() without .select() ───────────────────────────────
  for (const file of backendFiles) {
    const src = readFile(file);
    const lines = src.split('\n');

    lines.forEach((line, i) => {
      if (/\.find\(/.test(line) && !/\.select\(/.test(line)) {
        // Check next few lines for .select() chaining
        const snippet = lines.slice(i, i + 5).join('\n');
        if (!/\.select\(/.test(snippet)) {
          findings.push({
            title:  'Mongoose .find() without .select() — fetches all fields',
            file:   `${relPath(file)}:${i + 1}`,
            impact: 'High',
            issue:  'Fetching all document fields over the wire increases payload size and memory usage.',
            before: line.trim(),
            after:  line.trim().replace('.find(', '.find(') + '\n  .select("title slug price category location.area status createdAt")',
          });
        }
      }
    });
  }

  // ── Backend: await inside for/forEach (N+1 pattern) ──────────────────
  for (const file of backendFiles) {
    const src = readFile(file);
    const lines = src.split('\n');

    let inLoop = false;
    lines.forEach((line, i) => {
      if (/\bfor\b|\bforEach\b/.test(line)) inLoop = true;
      if (inLoop && /\bawait\b/.test(line) && /\.find\(|\.findById\(|\.findOne\(/.test(line)) {
        findings.push({
          title:  'N+1 query pattern — await DB call inside loop',
          file:   `${relPath(file)}:${i + 1}`,
          impact: 'High',
          issue:  'Database call inside a loop causes N+1 queries. Fetch all records with $in instead.',
          before: `for (...) {\n  await Model.findById(id)\n}`,
          after:  `const ids = items.map(i => i.id);\nconst docs = await Model.find({ _id: { $in: ids } });`,
        });
        inLoop = false;
      }
      if (/[{}]/.test(line)) inLoop = false;
    });
  }

  // ── Backend: missing compression ─────────────────────────────────────
  {
    const appSrc = readFile(path.join(BACKEND_DIR, 'app.js'));
    const hasCompression = /compression/.test(appSrc);
    if (!hasCompression) {
      findings.push({
        title:  'Compression middleware not applied',
        file:   'backend/app.js',
        impact: 'High',
        issue:  'HTTP responses are not gzip-compressed, increasing bandwidth usage by 60-80%.',
        before: 'app.use(express.json())',
        after:  `const compression = require('compression');\napp.use(compression());\napp.use(express.json())`,
      });
    }
  }

  // ── Backend: no response caching (Redis or node-cache) ───────────────
  {
    const srcAll = backendFiles.map(readFile).join('\n');
    const hasCaching = /node-cache|lru-cache|memoryCache|redis\.get|redisClient\.get/.test(srcAll);
    if (!hasCaching) {
      findings.push({
        title:  'No response-level caching detected',
        file:   'backend/controllers/',
        impact: 'High',
        issue:  'Property listings and public endpoints are hit on every request with no caching layer.',
        before: `// No cache\nconst properties = await Property.find(filter).limit(20);`,
        after:  `const cacheKey = 'props:' + JSON.stringify(filter);\nconst cached = await redis.get(cacheKey);\nif (cached) return res.json(JSON.parse(cached));\nconst properties = await Property.find(filter).limit(20);\nawait redis.set(cacheKey, JSON.stringify(properties), { EX: 300 }); // 5 min TTL`,
      });
    }
  }

  // ── Backend: readFileSync in controllers ─────────────────────────────
  for (const file of backendFiles) {
    const src = readFile(file);
    if (/readFileSync/.test(src)) {
      findings.push({
        title:  'Synchronous file read in request handler',
        file:   relPath(file),
        impact: 'High',
        issue:  'readFileSync blocks the Node.js event loop, preventing other requests from being processed.',
        before: `const data = fs.readFileSync(filePath, 'utf8');`,
        after:  `const data = await fs.promises.readFile(filePath, 'utf8');`,
      });
    }
  }

  // ── Backend: pagination missing ───────────────────────────────────────
  {
    const srcAll = backendFiles.map(readFile).join('\n');
    const hasPagination = /limit|skip|page|parsePagination/.test(srcAll);
    if (!hasPagination) {
      findings.push({
        title:  'No pagination detected on list endpoints',
        file:   'backend/controllers/',
        impact: 'High',
        issue:  'Fetching all records without pagination can return thousands of documents and exhaust memory.',
        before: `Property.find(filter)`,
        after:  `Property.find(filter).skip((page-1)*limit).limit(limit)`,
      });
    }
  }

  // ── Frontend: missing React.lazy ─────────────────────────────────────
  {
    const feSrc = frontendFiles.map(readFile).join('\n');
    const hasLazy = /React\.lazy|dynamic\(/.test(feSrc);
    if (!hasLazy) {
      findings.push({
        title:  'No code splitting (React.lazy / next/dynamic) detected',
        file:   'frontend/src/',
        impact: 'Medium',
        issue:  'All components are bundled in the initial JS bundle, increasing TTI (Time to Interactive).',
        before: `import HeavyComponent from './HeavyComponent'`,
        after:  `import dynamic from 'next/dynamic';\nconst HeavyComponent = dynamic(() => import('./HeavyComponent'), { ssr: false });`,
      });
    }
  }

  // ── Frontend: useEffect without dependency array ──────────────────────
  for (const file of frontendFiles) {
    const src = readFile(file);
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (/useEffect\(.*=>\s*\{?$/.test(line)) {
        // Check next 10 lines for closing ] dependency array
        const snippet = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');
        if (!/\],\s*\[/.test(snippet) && !/\[\]\)/.test(snippet) && !/\[.*\]\)/.test(snippet)) {
          findings.push({
            title:  'useEffect missing dependency array — causes unnecessary re-renders',
            file:   `${relPath(file)}:${i + 1}`,
            impact: 'Medium',
            issue:  'useEffect without dependency array runs on every render, causing API calls to repeat unnecessarily.',
            before: `useEffect(() => { fetchData(); })`,
            after:  `useEffect(() => { fetchData(); }, []) // add dependencies that fetchData uses`,
          });
        }
      }
    });
  }

  // ── Backend: Mongoose poolSize ────────────────────────────────────────
  {
    const dbSrc = readFile(path.join(BACKEND_DIR, 'config', 'db.js'));
    const hasPool = /maxPoolSize|poolSize/.test(dbSrc);
    if (!hasPool) {
      findings.push({
        title:  'Mongoose connection pool size not configured',
        file:   'backend/config/db.js',
        impact: 'Medium',
        issue:  'Default pool size (5) may be insufficient under load. Configure maxPoolSize for production.',
        before: `mongoose.connect(uri)`,
        after:  `mongoose.connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })`,
      });
    }
  }

  // ── Frontend: images without explicit width/height ────────────────────
  for (const file of frontendFiles) {
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.js')) continue;
    const src = readFile(file);
    const imgTags = src.match(/<img\s[^>]*>/g) || [];
    const bareImgs = imgTags.filter((tag) => !/width=|height=/.test(tag));
    if (bareImgs.length > 0) {
      findings.push({
        title:  'Images without explicit width/height cause layout shift (CLS)',
        file:   relPath(file),
        impact: 'Medium',
        issue:  `${bareImgs.length} <img> tag(s) without explicit dimensions — browser cannot reserve space before image loads.`,
        before: `<img src={url} alt="Property" />`,
        after:  `<Image src={url} alt="Property" width={400} height={300} /> // next/image`,
      });
    }
  }

  // ── Backend: indexes present (positive finding) ───────────────────────
  {
    const propSrc = readFile(path.join(BACKEND_DIR, 'models', 'mongoose', 'Property.js'));
    const hasCompoundIndexes = /propertySchema\.index\(\{.*\},/.test(propSrc.replace(/\n/g, ' '));
    if (hasCompoundIndexes) {
      // This is good — record as INFO
      findings.push({
        title:  '✅ Compound indexes defined on Property model',
        file:   'backend/models/mongoose/Property.js',
        impact: 'Low',
        issue:  'Compound indexes are present — queries on { category, isActive, price } will be fast.',
        before: '',
        after:  '',
      });
    }
  }

  return findings;
}

module.exports = { scan };
