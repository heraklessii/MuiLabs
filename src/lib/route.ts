/**
 * İki ekranlık yönlendirme: liste ve ürün detayı.
 *
 * Adres HASH'te tutuluyor (`#/uygulama/muiget`), yol segmentinde değil. Sebep
 * ortam farkı: Tauri bundle'ı `tauri://localhost` kökünden, vitrin ise
 * `/MuiLabs/` alt yolundan servis ediliyor ve GitHub Pages'in bilinmeyen
 * yolları index.html'e döndüren bir kuralı yok. `/uygulama/muiget` adresi
 * Pages'te düpedüz 404 olurdu; hash sunucuya hiç gitmez, ikisinde de çalışır.
 *
 * Router kütüphanesi yok: iki ekran için bağımlılık eklemek, vitrinin
 * bundle'ını kendisinden büyük bir şeye bağlamak olurdu.
 */

import { useEffect, useState } from "react";

export type Rota = { tur: "liste" } | { tur: "detay"; id: string };

const ONEK = "#/uygulama/";

export function detayYolu(id: string): string {
  return ONEK + encodeURIComponent(id);
}

/**
 * Adresi rotaya çevirir.
 *
 * `gecerliIdler` veriliyorsa tanınmayan id liste ekranına düşer: kullanıcı
 * eski bir bağlantıyla gelirse boş bir detay sayfası yerine vitrini görür.
 */
export function rotayiCoz(hash: string, gecerliIdler?: readonly string[]): Rota {
  if (!hash.startsWith(ONEK)) return { tur: "liste" };

  const ham = hash.slice(ONEK.length);
  let id: string;
  try {
    id = decodeURIComponent(ham);
  } catch {
    // Bozuk yüzde kaçışı (`#/uygulama/%`) — decodeURIComponent atar.
    return { tur: "liste" };
  }

  if (!id) return { tur: "liste" };
  if (gecerliIdler && !gecerliIdler.includes(id)) return { tur: "liste" };
  return { tur: "detay", id };
}

/**
 * Geçerli rota. Tarayıcının ileri/geri düğmeleri `hashchange` üzerinden
 * çalışır — kendi geçmiş yığınımızı tutmuyoruz.
 */
export function useRota(gecerliIdler: readonly string[]): Rota {
  const [rota, setRota] = useState<Rota>(() => rotayiCoz(location.hash, gecerliIdler));

  useEffect(() => {
    const dinleyici = () => setRota(rotayiCoz(location.hash, gecerliIdler));
    window.addEventListener("hashchange", dinleyici);
    // Liste id'leri config'ten geliyor ve çalışma anında değişmiyor; yine de
    // ilk okumadan sonra değişmiş olma ihtimaline karşı bir kez daha çözüyoruz.
    dinleyici();
    return () => window.removeEventListener("hashchange", dinleyici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gecerliIdler.join(",")]);

  return rota;
}

/** Liste ekranına dön. `history.back()` DEĞİL: kullanıcı detaya doğrudan bir
 *  bağlantıyla gelmiş olabilir, o zaman geri gidecek bir yer yok. */
export function listeyeDon(): void {
  location.hash = "";
}
