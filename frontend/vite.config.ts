import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": "/src",
      "@assets": "/src/assets",
      "@utils": "/src/shared/utils",
      "@components": "/src/shared/components",
      "@features": "/src/features",
      "@apis": "/src/apis",
      "@pages": "/src/pages",
      "@styles": "/src/styles",
    },
  },
});
