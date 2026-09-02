import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { apps, validateApps } from "./config/apps.config";
import { isTauri } from "./lib/platform";
import "./styles.css";

/*
 * Ortam farkı gövde sınıfına yazılıyor: masaüstünde metin seçimi kapalı,
 * vitrinde açık. Bileşenler bunu bilmiyor, CSS hallediyor.
 */
if (isTauri()) {
  document.body.classList.add("tauri");
}

/*
 * Config tutarlılık denetimi yalnız geliştirmede.
 *
 * Üretimde çalıştırıp build'i kırmıyoruz: tek bir bozuk kayıt yüzünden
 * kullanıcının vitrini bomboş açılmasın. Hata geliştirici konsolunda,
 * kullanıcı ekranında değil.
 */
if (import.meta.env.DEV) {
  const hatalar = validateApps(apps);
  for (const hata of hatalar) {
    console.error(`[MuiLabs config] ${hata}`);
  }
}

const kok = document.getElementById("root");
if (!kok) throw new Error("#root bulunamadı");

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
