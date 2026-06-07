const fs = require('fs');
const path = require('path');

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
