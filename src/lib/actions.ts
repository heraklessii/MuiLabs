/**
 * Ortam farkını soğuran eylem katmanı.
 *
 * Kart bileşenleri Tauri'de mi vitrinde mi olduklarını bilmez; `indir()` ve
 * `disLinkAc()` çağırır, ayrım burada biter. Tauri API'leri TOP-LEVEL import
 * EDİLMEZ — dinamik import sayesinde vitrin bundle'ına Rust köprüsü kodu
 * girmiyor ve web build'i kırılmıyor.
 */

import { isTauri } from "./platform";

/** Tauri komutu tamamlanınca dosyanın indiği yol; vitrinde bilinmez. */
export interface IndirmeSonucu {
  /** Tauri'de dosyanın yazıldığı tam yol, vitrinde null. */
  yol: string | null;
}

/**
 * Bir release asset'ini indirir.
 *
 * Tauri: Rust tarafı dosyayı kullanıcının "İndirilenler" klasörüne yazar.
 * Vitrin: tarayıcının kendi indirme akışı tetiklenir.
 *
 * `<a download>` niteliği yalnız aynı origin'de çalışır; GitHub'ın asset
 * adresi başka bir origin olduğu için tarayıcı `download`u yok sayar ve
 * dosyayı yine de indirir (Content-Disposition sayesinde). Dosya adını
 * yine de veriyoruz: aynı origin'e taşınırsak davranış korunsun.
 */
export async function indir(url: string, dosyaAdi: string): Promise<IndirmeSonucu> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    const yol = await invoke<string>("download_file", { url, filename: dosyaAdi });
    return { yol };
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = dosyaAdi;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return { yol: null };
}

/**
 * Dış bağlantıyı açar.
 *
 * Tauri'de `window.open` yeni bir WebView penceresi açardı — mağaza sayfasını
 * uygulamanın içinde göstermek istemiyoruz; kullanıcının kendi tarayıcısına
 * gitmeli. Rust `opener` eklentisi bunu yapıyor.
 */
export async function disLinkAc(url: string): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("open_external", { url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Vitrin ve Tauri farklı köklerden servis ediliyor (Pages'te /MuiLabs/,
 * Tauri'de /). `public/` altındaki varlıklara elle yol yazmak ikisinden
 * birinde 404 demek; Vite'in verdiği taban buradan geçirilir.
 */
export function varlikYolu(gorecelYol: string): string {
  return import.meta.env.BASE_URL + gorecelYol.replace(/^\//, "");
}
