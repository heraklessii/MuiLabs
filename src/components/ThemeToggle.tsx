import { useEffect, useState } from "react";

import { IconMoon, IconSun } from "./Icons";

type Tema = "dark" | "light";

const ANAHTAR = "muilabs-tema";

/**
 * Tema seçimi `<html data-theme>` üzerinden; bütün renkler jetonlardan
 * geldiği için tek bir öznitelik bütün arayüzü çeviriyor.
 *
 * Varsayılan koyu: Mui ailesinin bütün uygulamaları koyu açılıyor, vitrin
 * onlardan farklı açılırsa aile hissi kırılır. Sistem tercihi bu yüzden
 * okunmuyor — kullanıcının açık seçimi ise kalıcı.
 */
function baslangicTemasi(): Tema {
  try {
    const kayitli = localStorage.getItem(ANAHTAR);
    if (kayitli === "light" || kayitli === "dark") return kayitli;
  } catch {
    // Gizli sekme / depolama kapalı: tercih hatırlanmaz, açılış yine çalışır.
  }
  return "dark";
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>(baslangicTemasi);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem(ANAHTAR, tema);
    } catch {
      // yok sayılır
    }
  }, [tema]);

  const sonraki = tema === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="dugme"
      onClick={() => setTema(sonraki)}
      aria-label={sonraki === "light" ? "Açık temaya geç" : "Koyu temaya geç"}
      title={sonraki === "light" ? "Açık tema" : "Koyu tema"}
    >
      {tema === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
