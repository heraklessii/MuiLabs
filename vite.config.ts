import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Iki hedef, tek kod tabani (docs/dual-target-architecture.md):
//
//   npm run build            -> Tauri icin kok yoldan servis edilen bundle
//   VITRIN=1 npm run build   -> GitHub Pages icin /MuiLabs/ alt yolundan
//
// Ayrimi ortam degiskeniyle yapiyoruz cunku Tauri, dist'i `tauri://localhost`
// kokunden servis ediyor; oraya Pages'in alt yolunu koyarsak butun varliklar
// 404 olur. Repo adi degisirse burasi da degismeli.
const vitrin = process.env.VITRIN === "1";

// Tauri dev sunucusunu sabit portta bekler; port doluysa fail etmeli ki
// Tauri penceresi yanlis bir adrese baglanmasin.
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  base: vitrin ? "/MuiLabs/" : "/",

  plugins: [react()],

  // Tauri CLI'in urettigi hatalari gizlememek icin
  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: {
      // Rust tarafi degisince Vite'in bosuna yeniden derlemesini engelle
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    // Kaynak haritalari yalniz gelistirmede; vitrin bundle'i kucuk kalsin.
    sourcemap: !vitrin,
  },
});
