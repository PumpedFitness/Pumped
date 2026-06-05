// Auto-maintained migration bundle for expo-sqlite.
// After running `bun run db:generate`, add new entries here.

import journal from './meta/_journal.json';
import m0000 from './0000_harsh_meggan.sql';

export default {
  journal,
  migrations: {
    '0000_harsh_meggan': m0000,
  },
};
