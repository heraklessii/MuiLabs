import { useEffect, useState } from "react";

import { type AlgilananPlatform, detectPlatform } from "../lib/platform";

/**
 * Kullanıcının işletim sistemi.
 *
 * Tauri'de Rust'a invoke gerektiği için async; ilk render'da henüz bilinmiyor.
 * O anda "unknown" dönmüyoruz — "unknown" *algılayamadık* demek ve UI onu
 * görünce üç platformu birden gösteriyor. Yükleme anını ondan ayırmak için
 * ayrı bir null hâli var.
 */
export function usePlatform(): AlgilananPlatform | null {
  const [platform, setPlatform] = useState<AlgilananPlatform | null>(null);

  useEffect(() => {
    let iptal = false;

    detectPlatform().then((p) => {
      if (!iptal) setPlatform(p);
    });

    return () => {
      iptal = true;
    };
  }, []);

  return platform;
}
