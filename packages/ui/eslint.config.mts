import { composeConfig } from "@workspace/eslint-config";
import type { Linter } from "eslint";

const config: Linter.Config[] = composeConfig({
  stylistic: false,
  unicorn: false,
  prettier: false,
  typescript: {
    overrides: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    }
  }
});
export default config;
