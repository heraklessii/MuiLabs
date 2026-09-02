/**
 * Ortam ve işletim sistemi algılama.
 *
 * MuiLabs iki yerde çalışıyor: Tauri penceresi ve GitHub Pages'teki statik
 * vitrin. `if (isTauri())` dallanması SADECE bu dosyada ve `download.ts`
 * içinde olmalı — kart bileşenleri hangi ortamda olduklarını bilmemeli.
 * Bkz. docs/dual-target-architecture.md.
 */

import type { Platform } from "../config/apps.config";

/** Algılanamayan durum ayrı bir değer: yanlış tahmin etmektense bilmemek iyi. */
export type AlgilananPlatform = Platform | "unknown";

/**
 * Tauri v2'de global `__TAURI__` değil `__TAURI_INTERNALS__` var.
 * Tauri 1.x örneklerine güvenme; v2 API farklı.
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Web ortamında tahmini algılama.
 *
 * `navigator.platform` deprecated olduğu için `userAgent` kullanılıyor. Ama UA
 * dizesi tarayıcılarca giderek daha çok donduruluyor (User-Agent Client Hints
 * geçişi), yani bu fonksiyon "unknown" dönebilir ve dönmesi de doğrudur —
 * çağıran taraf sessizce bir platform varsaymamalı.
 */
export function detectPlatformWeb(): AlgilananPlatform {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent.toLowerCase();

  // Sıra önemli: "Android" içinde "linux" da geçiyor, ama Android bizim
  // dağıttığımız masaüstü paketlerinden hiçbirini çalıştıramaz.
  if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
    return "unknown";
  }
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

/**
 * Birleşik API. Tauri'de Rust'tan kesin bilgi gelir, web'de tahmin edilir.
 *
 * Tauri tarafındaki `get_platform` komutu `std::env::consts::OS` döndürür;
 * macOS orada "macos" olarak geçiyor, biz "mac" kullanıyoruz.
 */
export async function detectPlatform(): Promise<AlgilananPlatform> {
  if (!isTauri()) return detectPlatformWeb();

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const os = await invoke<string>("get_platform");
    if (os === "macos") return "mac";
    if (os === "windows" || os === "linux") return os;
    return "unknown";
  } catch {
    // Komut kayıtlı değilse veya invoke patlarsa vitrin gibi davran; kullanıcı
    // üç platformu da elle seçebilir, hiçbir şey göstermemekten iyi.
    return detectPlatformWeb();
  }
}

const ADLAR: Record<Platform, string> = {
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
};

/** Buton metni asla sadece "İndir" olmamalı; kullanıcı ne indirdiğini görmeli. */
export function platformAdi(p: Platform): string {
  return ADLAR[p];
}

export const TUM_PLATFORMLAR: Platform[] = ["windows", "mac", "linux"];
