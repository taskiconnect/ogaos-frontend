import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import nextPlugin from "@next/eslint-plugin-next"; 

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Optional: explicitly include the Next.js plugin if you want more control
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      // Keep the recommended Next.js rules, but turn off the noisy one
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      "@next/next/no-page-custom-font": "off", // ← this disables the warning
    },
  },

  // Override default ignores of eslint-config-next (you already have this)
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;