import { resolve } from 'node:path';

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith('file:') && !databaseUrl.startsWith('file:/')) {
  process.env.DATABASE_URL = `file:${resolve(import.meta.dir, '..', databaseUrl.slice('file:'.length))}`;
}

const server = Bun.spawn(['bun', '.next/standalone/server.js'], {
  env: process.env,
  stderr: 'inherit',
  stdout: 'inherit',
});

process.exit(await server.exited);
