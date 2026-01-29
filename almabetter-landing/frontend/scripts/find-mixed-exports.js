const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const exts = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.next' || name === '.git') continue;
      res.push(...walk(full));
    } else if (exts.includes(path.extname(name))) {
      res.push(full);
    }
  }
  return res;
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return '';
  }
}

function hasDefaultExport(content) {
  return /export\s+default\s+/m.test(content) || /module\.exports\s*=\s*/m.test(content);
}

function hasNamedExports(content) {
  // crude check for other exports
  return /export\s+(const|let|var|function|class)\s+/m.test(content) || /export\s+\{/.test(content) || /exports\.|module\.exports\.(?!default)/.test(content);
}

function findImporters(files, targetRel) {
  const importers = [];
  const importRegex = new RegExp("from\\s+['\"](.+)['\"]|require\\(\\s*['\"](.+)['\"]\\s*\)");
  for (const f of files) {
    const content = read(f);
    if (!content) continue;
    const matches = content.matchAll(/from\s+['\"]([^'\"]+)['\"]|require\(\s*['\"]([^'\"]+)['\"]\s*\)/g);
    for (const m of matches) {
      const imp = m[1] || m[2];
      if (!imp) continue;
      // resolve simple relative imports
      if (imp.startsWith('.')) {
        const resolved = path.normalize(path.join(path.dirname(f), imp));
        const candidates = exts.map(e => resolved + e).concat([resolved, resolved + '/index.js', resolved + '/index.jsx']);
        for (const c of candidates) {
          try {
            if (path.relative(root, c) === targetRel) {
              importers.push(f);
            }
          } catch (e) {}
        }
      }
    }
  }
  return [...new Set(importers)];
}

function main() {
  console.log('Scanning project for files that may trigger Fast Refresh full reload...');
  const files = walk(root);
  const reports = [];
  for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const content = read(f);
    if (!content) continue;
    if (hasDefaultExport(content) && hasNamedExports(content)) {
      const importers = findImporters(files, rel);
      reports.push({ file: rel, importers });
    }
  }

  if (reports.length === 0) {
    console.log('No files found that both default-export a value and also have named exports.');
    console.log('This scan is heuristic — Fast Refresh issues can also come from client/server boundaries or editing files imported by non-React code.');
    process.exit(0);
  }

  console.log('\nCandidates:');
  for (const r of reports) {
    console.log('\n- ' + r.file);
    if (r.importers && r.importers.length) {
      console.log('  Imported by:');
      for (const im of r.importers) console.log('    - ' + path.relative(root, im).replace(/\\/g, '/'));
    } else {
      console.log('  (No relative importers found in project files)');
    }
  }

  console.log('\nIf you see a file listed above, consider moving non-React exports into a separate module, or split the file to avoid mixing component exports and non-React values.');
}

main();
