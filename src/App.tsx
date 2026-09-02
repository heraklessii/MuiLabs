import { useEffect, useMemo } from "react";

import { apps } from "./config/apps.config";
import { AppCard } from "./components/AppCard";
import { AppDetail } from "./components/AppDetail";
import { ThemeToggle } from "./components/ThemeToggle";
import { disLinkAc, varlikYolu } from "./lib/actions";
import { listeyeDon, useRota } from "./lib/route";

const GITHUB_PROFIL = "https://github.com/heraklessii";
const BASLIK = "MuiLabs — Mui uygulamaları";

/**
 * MuiLabs vitrini: liste ve ürün detayı.
 *
 * Adres hash'te tutuluyor (bkz. lib/route.ts) — hem Tauri penceresinde hem
 * Pages'in alt yolunda aynı şekilde çalışan tek yol.
 */
export default function App() {
  const idler = useMemo(() => apps.map((a) => a.id), []);
  const rota = useRota(idler);
  const secili = rota.tur === "detay" ? (apps.find((a) => a.id === rota.id) ?? null) : null;

  // Sekme başlığı ve kaydırma konumu rotayla birlikte gitmeli: detaya girip
  // listeye dönünce sayfanın ortasında uyanmak, kartın nerede olduğunu
  // kullanıcıya yeniden arattırıyor.
  useEffect(() => {
    document.title = secili ? `${secili.name} — MuiLabs` : BASLIK;
    window.scrollTo(0, 0);
  }, [secili]);

  // Detaydan çıkmanın klavye yolu. Liste ekranında dinleyici hiç kurulmuyor.
  useEffect(() => {
    if (!secili) return;

    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") listeyeDon();
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [secili]);

  return (
    <div className="kabuk">
      <header className="ust">
        {/* Marka her iki ekranda da listeye dönen bağlantı; detaydayken
            "geri" düğmesinin yanında ikinci bir çıkış yolu oluyor. */}
        <a className="marka" href="#">
          <img
            className="marka-ikon"
            src={varlikYolu("icons/muilabs.svg")}
            alt=""
            width={44}
            height={44}
          />
          <div className="marka-yazi">
            <span className="marka-ad">MuiLabs</span>
            <p>Mui ailesinin bütün uygulamaları tek yerde</p>
          </div>
        </a>

        <ThemeToggle />
      </header>

      <main>
        {secili ? (
          <AppDetail key={secili.id} app={secili} />
        ) : (
          <>
            {/* Liste ekranında sayfa başlığı h1; detayda o rolü ürün adı
                üstleniyor, iki h1 olmasın diye burada duruyor. */}
            <h1 className="gorunmez">Mui uygulamaları</h1>
            <ul className="izgara">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </ul>
          </>
        )}
      </main>

      <footer className="alt">
        <span>
          Sürümler her açılışta doğrudan GitHub'dan okunuyor — burada saklanan bir kopya yok.
        </span>
        <div className="digerleri">
          <button type="button" onClick={() => void disLinkAc(GITHUB_PROFIL)}>
            github.com/heraklessii
          </button>
        </div>
      </footer>
    </div>
  );
}
