import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import AutoImport from "unplugin-auto-import/vite";
import checker from "vite-plugin-checker";
import * as lucide from "lucide-react";

// 只把 lucide 带 Icon 后缀的别名（MapIcon / FileIcon / StarIcon ...）纳入 auto-import。
// 这组名字由 lucide 官方 PR #2328 提供，天然不与 JS 全局 / DOM / React 导出撞名。
// 配合 src/vite-env.d.ts 里的 `declare module "lucide-react"` 重定向使用。
const lucideIconNames = Object.keys(lucide).filter(
  (k) => /^[A-Z]/.test(k) && k.endsWith("Icon")
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    AutoImport({
      dts: "auto-imports.d.ts",
      include: [/\.[tj]sx?$/],
      imports: [
        "react",
        { "lucide-react": lucideIconNames },
        { from: "react", imports: [["*", "React"]] },
      ],
      eslintrc: { enabled: false },
    }),
    checker({
      typescript: {
        tsconfigPath: "tsconfig.app.json",
      },
      enableBuild: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
  preview: {
    port: 5174,
    strictPort: false,
  },
});
