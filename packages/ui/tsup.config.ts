import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/utils.ts', 'src/components/*.tsx'],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  tsconfig: './tsconfig.build.json',
});
