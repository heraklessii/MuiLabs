# Platform Algılama (Windows / Mac / Linux)

## Amaç

Kullanıcıya "hangi dosyayı indireyim" sorusu sormadan, doğru release asset'ini
otomatik seçip indirme butonuna tek tıkla o dosyayı bağlamak.

## Tauri Ortamında (kesin)

```rust
// src-tauri/src/platform.rs
#[tauri::command]
fn get_platform() -> &'static str {
    std::env::consts::OS // "windows" | "macos" | "linux"
}
```

Rust tarafı %100 doğru bilgi verir, frontend sadece invoke eder:

```typescript
const platform = await invoke<string>("get_platform");
```

## Web Ortamında (tahmini — UA sniffing)

```typescript
// src/lib/platform.ts
export function detectPlatformWeb(): "windows" | "mac" | "linux" | "unknown" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}
```

`navigator.platform` deprecated olduğu için `userAgent` tercih edilir, ama UA
string'i tarayıcılar tarafından giderek daha çok "freeze" ediliyor (User-Agent
Client Hints geçişi). Bu yüzden:

- **"unknown" veya belirsiz durumda asla sessizce yanlış tahmin etme.**
  Kullanıcıya üç platform butonunu da göster, algılananı vurgula
  (örn. "Windows (önerilen)" + diğer ikisi daha küçük/soluk).
- Bu, hem UX açısından güvenli hem de yanlış OS indirmesini önler.

## Birleşik API

```typescript
// src/lib/platform.ts
export async function detectPlatform(): Promise<"windows" | "mac" | "linux" | "unknown"> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    const os = await invoke<string>("get_platform");
    return os === "macos" ? "mac" : (os as "windows" | "linux");
  }
  return detectPlatformWeb();
}
```

## UI Kuralı

`AppCard` bileşeni:
1. `detectPlatform()` sonucuna göre öne çıkan bir "İndir (Windows)" butonu gösterir
2. Altında küçük "diğer platformlar" linkleri (Mac/Linux) — algılanan asset yoksa
   o platform gizlenir, algılanamadıysa (unknown) hepsi eşit ağırlıkta gösterilir
3. Buton metni asla sadece "İndir" değil, her zaman platform adını içerir —
   kullanıcı yanlış dosya indirdiğini fark edebilsin
