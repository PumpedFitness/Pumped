const fs = require('fs');
const path = require('path');

// Fix Metro 0.84 source map crash on Node 25+.
// metro-source-map throws on full source map objects; skip them instead.
const sourceMapFile = path.join(
  __dirname, '..', 'node_modules', 'metro-source-map', 'src', 'source-map.js',
);
if (fs.existsSync(sourceMapFile)) {
  let content = fs.readFileSync(sourceMapFile, 'utf8');
  const needle = `throw new Error(\n        \`Unexpected module with full source map found: \${mod.path}\`,\n      );`;
  if (content.includes(needle)) {
    content = content.replace(needle, `// Patched: skip modules with full source maps instead of crashing\n        void 0;`);
    fs.writeFileSync(sourceMapFile, content);
    console.log('[postinstall] Patched metro-source-map for Node 25+ compatibility');
  }
}

// expo-sqlite requires sqlite3.c and sqlite3.h to be copied from vendor/ to ios/
// The podspec normally does this, but bun's node_modules handling prevents it.
const expoSqliteDir = path.join(__dirname, '..', 'node_modules', 'expo-sqlite');
const vendorDir = path.join(expoSqliteDir, 'vendor', 'sqlite3');
const iosDir = path.join(expoSqliteDir, 'ios');

if (fs.existsSync(vendorDir) && fs.existsSync(iosDir)) {
  for (const file of ['sqlite3.c', 'sqlite3.h']) {
    const src = path.join(vendorDir, file);
    const dest = path.join(iosDir, file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`[postinstall] Copied ${file} to expo-sqlite/ios/`);
    }
  }
}
