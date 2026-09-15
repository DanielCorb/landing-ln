import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Flat config, matching the dashboard's.
 *
 * This used to go through `FlatCompat` from `@eslint/eslintrc`, which is not among the
 * project's dependencies — so `pnpm lint` failed to even start. `eslint-config-next`
 * ships flat configs directly, so the compatibility layer is not needed.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
