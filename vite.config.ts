import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Gera source maps para produção (facilita debug sem expor código)
    sourcemap: false,
    // Tamanho do chunk warning: 600kb (xlsx é pesado)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separa dependências pesadas em chunks próprios
        // Isso melhora o cache do browser: app muda, mas xlsx/recharts não
        manualChunks: {
          "vendor-react":    ["react", "react-dom"],
          "vendor-recharts": ["recharts"],
          "vendor-xlsx":     ["xlsx"],
        },
      },
    },
  },
  // Necessário para PWA funcionar em preview local
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      // Headers de segurança recomendados
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
