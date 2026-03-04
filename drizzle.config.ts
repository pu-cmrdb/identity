import { env } from '@/env';

import type { Config } from 'drizzle-kit';

export default {
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'sqlite',
  schema: './src/server/database/schema.ts',
  tablesFilter: ['identity_*'],
} satisfies Config;
