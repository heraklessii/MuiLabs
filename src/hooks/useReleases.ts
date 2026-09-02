import { useEffect, useState } from "react";

import { GithubHatasi, enGuncelSurum, fetchReleases, type Release } from "../lib/github";

export interface ReleaseDurumu {
  yukleniyor: boolean;
  /** İndirilebilir sürüm. null = repo public ama uygun sürüm yok — hata DEĞİL. */
  release: Release | null;
  /** Yayınlanmış sürümlerin tamamı, yeniden eskiye. Detay sayfasındaki geçmiş. */
  tumu: Release[];
  /** Kullanıcıya gösterilecek kısa metin; teknik ayrıntı konsolda kalır. */
  hata: string | null;
}

const BASLANGIC: ReleaseDurumu = { yukleniyor: true, release: null, tumu: [], hata: null };

/**
 * Bir deponun sürümleri.
 *
 * Kart yalnız `release`i, detay sayfası `tumu`nu kullanıyor — ikisi de aynı
 * listeden okuyor. Detay sayfasında indirme bloğu ile sürüm geçmişi aynı anda
 * mount olduğu için `fetchReleases` bu iki çağrıyı tek isteğe indiriyor;
 * 60 istek/saat kotası bu kadarcık ölçekte bile boşa harcanmamalı.
 *
 * Oturum boyunca component state'inde durur (re-render'da tekrar istek yok),
 * ama sayfa yenilenince baştan çekilir — kalıcı cache kasıtlı olarak yok.
 */
export function useReleases(repo: string, allowPrerelease = false): ReleaseDurumu {
  const [durum, setDurum] = useState<ReleaseDurumu>(BASLANGIC);

  useEffect(() => {
    // İstek iptal edilmiyor, sonucu yok sayılıyor: `fetchReleases` aynı depoyu
    // bekleyen bütün bileşenlere aynı promise'i veriyor, birinin sökülmesi
    // diğerinin verisini götüremez.
    let iptal = false;
    setDurum(BASLANGIC);

    fetchReleases(repo)
      .then((tumu) => {
        if (iptal) return;
        setDurum({
          yukleniyor: false,
          release: enGuncelSurum(tumu, allowPrerelease),
          tumu,
          hata: null,
        });
      })
      .catch((err: unknown) => {
        if (iptal) return;

        // Kullanıcıya sebebi değil, ne yapabileceğini söyleyen bir metin
        // gösteriyoruz; her durumda GitHub'a giden bir kaçış yolu kalıyor.
        const mesaj =
          err instanceof GithubHatasi && err.rateLimit
            ? "Şu an kontrol edilemiyor"
            : "Sürüm bilgisi alınamadı";

        console.error(`[MuiLabs] ${repo}:`, err);
        setDurum({ yukleniyor: false, release: null, tumu: [], hata: mesaj });
      });

    return () => {
      iptal = true;
    };
  }, [repo, allowPrerelease]);

  return durum;
}
