import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/schema/index.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  //   external: ['drizzle-orm', 'drizzle-orm/postgres-js', 'pg', 'pg-core'],
});
