import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["_legacy-vite-scaffold/**", ".next/**", "node_modules/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
