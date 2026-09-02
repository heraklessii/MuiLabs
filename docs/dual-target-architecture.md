# Dual-Target Mimari: Tauri Masaüstü + GitHub Pages Web

> Bu doküman uygulanmış hâli anlatır. Kod: `src/lib/platform.ts`,
> `src/lib/actions.ts`, `src-tauri/src/`.

## Neden Tek Kod Tabanı

MuiLabs iki yerde yaşıyor:
1. **Tauri v2 masaüstü app** — diğer Mui ürünleriyle aynı launcher deneyimi
2. **GitHub Pages statik site** — link paylaşımı, tarayıcıdan hızlı erişim

Aynı React/TS frontend'i, environment'a göre davranış değiştirerek her ikisinde
de çalışıyor. İki ayrı frontend yazmak bakım yükünü ikiye katlardı.

## Ortam Algılama

```typescript
// src/lib/platform.ts
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
```

Tauri v2'de global `__TAURI__` yerine `__TAURI_INTERNALS__` kullanılıyor —
Tauri 1.x örneklerine güvenme, v2 API farklı.

## Davranış Farkları (SADECE bunlar)

| Özellik | Tauri | Web (GitHub Pages) |
|---|---|---|
| Dosya indirme | `download_file` komutu → İndirilenler klasörüne yazar | `<a download>` ile tarayıcı indirmesi |
| OS algılama | `get_platform` → `std::env::consts::OS` (kesin) | `navigator.userAgent` (tahmini, "unknown" dönebilir) |
| Dış link açma | `open_external` → `tauri-plugin-opener`, kullanıcının tarayıcısı | `window.open(url, "_blank")` |
| Metin seçimi | kapalı (`body.tauri`) | açık |
| Build çıktısı | `tauri build` → .msi/.exe | `VITRIN=1 vite build` → statik `dist/` → gh-pages |

**Bunların dışında hiçbir davranış farkı yok.** `if (isTauri())` dallanması
sadece `lib/platform.ts` ve `lib/actions.ts` içinde; `AppCard` bu detayı
bilmiyor, `indir()` / `disLinkAc()` gibi soyut fonksiyonlar çağırıyor.

## Eylem Soyutlaması

```typescript
// src/lib/actions.ts
export async function indir(url: string, dosyaAdi: string): Promise<IndirmeSonucu> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    const yol = await invoke<string>("download_file", { url, filename: dosyaAdi });
    return { yol };
  }
  // ... <a download> ile tarayıcı indirmesi
}
```

Tauri API'leri **top-level import EDİLMİYOR**, dinamik import ile çağrılıyor.
Sonuç web build'de ölçülebilir: `@tauri-apps/api/core` ayrı bir chunk'a
düşüyor ve vitrin bundle'ında ~0.13 kB yer kaplıyor.

## Rust Komutlarının Sınırları

`download_file` ve `open_external`, arayüzden gelen bir dizeyi işletim
sistemine veriyor. İkisi de dar kapıdan geçiyor:

- **`download_file`** yalnız `github.com`, `objects.githubusercontent.com` ve
  `release-assets.githubusercontent.com` konaklarından, yalnız `https` ile
  indirir. Dosya adı `Path::file_name` ile tek bir ada indirgenir — `../` ile
  klasör dışına çıkılamaz. Aynı adda dosya varsa üzerine yazmaz, `ad (2).uzanti`
  açar. Yarıda kesilen indirme diskte bırakılmaz.
- **`open_external`** yalnız `https://` ile başlayan adresi açar. `file:`,
  `ms-settings:` ve kayıtlı uygulama şemaları bir program çalıştırma yolu
  olurdu.

Bu kontroller `src-tauri/src/download.rs` içindeki testlerle korunuyor
(`cargo test`). Gevşetme.

## Build/Deploy Ayrımı

- **Tauri build**: `npm run tauri build`. `beforeBuildCommand: npm run build`
  → kök yoldan servis edilen bundle (`base: "/"`).
- **Web build**: `VITRIN=1 npm run build` → `base: "/MuiLabs/"`.
  `.github/workflows/pages.yml` bunu çalıştırıp `dist/`i `gh-pages` dalına
  itiyor.

Ayrımın ortam değişkeniyle yapılmasının sebebi: Tauri `dist/`i
`tauri://localhost` kökünden servis ediyor; oraya Pages'in alt yolunu koyarsak
bütün varlıklar 404 olur. **Depo adı değişirse `vite.config.ts` içindeki
`/MuiLabs/` de değişmeli.**

`public/` altındaki varlıklara elle yol yazma; `varlikYolu()` fonksiyonundan
geçir (o `import.meta.env.BASE_URL`i uyguluyor). Aksi hâlde ikisinden birinde
ikon 404 olur.

## Yönlendirme İki Hedefte Neden Hash

Detay sayfasının adresi `#/uygulama/<id>` (`src/lib/route.ts`). Yol segmenti
(`/uygulama/muiget`) iki hedefte de çalışmazdı:

- **Pages**: bilinmeyen yolları `index.html`e döndüren bir kural yok, adres
  düpedüz 404 olur. (`404.html` kopyası koymak da vitrin base'iyle uğraşmak
  demek.)
- **Tauri**: bundle `tauri://localhost` kökünden servis ediliyor, orada da
  yolu karşılayan bir sunucu yok.

Hash sunucuya hiç gitmiyor, ikisinde de aynı çalışıyor. İki ekran için router
kütüphanesi eklenmedi — bağımlılık vitrinin bundle'ından büyük olurdu.

## Yapılmaması Gerekenler

- Web build'de Tauri API'lerini top-level import ETME (build'i kırar)
- OS algılamasını web'de "kesin doğru" varsayma — `detectPlatformWeb()`
  "unknown" dönebilir ve dönmesi de doğrudur; UI o durumda üç platformu da
  eşit gösteriyor, sessizce birini seçmiyor
- İki ayrı `App.tsx` / component seti tutma — tek kaynak, environment branch'i
  sadece lib katmanında
