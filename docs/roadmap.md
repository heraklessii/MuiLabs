# Roadmap

## Faz 0 — Gerçeklik Denetimi ✅ (2026-09-03)
- [x] Kardeş projelerin diskteki konumları ve repo adları doğrulandı
- [x] Mui tasarım jetonları `Muiget/src/styles.css`'ten çıkarıldı
- [x] Repo/release/asset durumu GitHub API'den doğrulandı, uydurma
      placeholder'lar temizlendi
- [x] `releases/latest` prerelease tuzağı bulundu ve çözüme bağlandı

## Faz 1 — İskelet + Statik Kayıt ✅
- [x] Vite + React 19 + TS kurulumu (Muiget'in sürüm setiyle hizalı)
- [x] Mui tasarım jetonları + gömülü Outfit (`src/styles.css`)
- [x] `apps.config.ts` — 5 ürünün doğrulanmış kayıtları + `validateApps()`
- [x] `AppCard`, beş `distribution.type` için de doğru render
- [x] `isTauri()` / `detectPlatform()` (`src/lib/platform.ts`)
- [x] Grid ana sayfa, status rozetleri, tema düğmesi
- [x] İkon seti (`public/icons/`) — her ürünün kendi favicon'uyla aynı çizim

## Faz 2 — GitHub Entegrasyonu ✅
- [x] `fetchLatestRelease` (prerelease destekli, `/releases` listesi üzerinden)
- [x] `useLatestRelease` hook, iptal edilebilir istek
- [x] Öncelik sıralı platform asset eşleştirme (`asset-match.ts`)
- [x] Otomatik indirme — Tauri: Rust `download_file`, web: `<a download>`
- [x] Kenar durumlar: sürüm yok, rate limit, eşleşmeyen asset, ön sürüm rozeti

## Faz 3 — Dual Build + Deploy ✅
- [x] `VITRIN=1` ile `/MuiLabs/` base path, doğrulandı
- [x] Tauri v2 katmanı: `get_platform`, `download_file`, `open_external`
- [x] `cargo test` — indirme güvenlik kontrolleri test altında
- [x] `.github/workflows/` — ci, pages (gh-pages dalı), release (tauri-action)
- [x] Web build'de Tauri kodunun ayrı chunk'a düştüğü doğrulandı (0.09 kB)

## Faz 4 — Cilalama ✅ (kodun bitebilecek kısmı)
- [x] Detay sayfası — `#/uygulama/<id>` hash rotası, router kütüphanesiz
      (`src/lib/route.ts`, `src/components/AppDetail.tsx`)
- [x] `screenshots?: Screenshot[]` + `highlights?` + `lisans?` + `publicRepo?`
      alanları; kartlarda 16:9 önizleme bandı, görseli olmayanda ikondan
      üretilen nötr doku
- [x] Sürüm geçmişi (son 10), gerçek tarih ve paket boyutlarıyla
- [x] Aksiyon bloğu kart ile detay arasında paylaşıldı (`AppActions.tsx`) —
      iki ekranın farklı şey söylemesi artık imkânsız
- [x] Eşzamanlı istek birleştirme: detay sayfası aynı depoyu iki kez sormuyor
- [x] Sosyal önizleme görseli — `tools/social-preview.html` → headless Edge →
      `public/social-preview.png`; og:image, twitter:card, canonical eklendi
- [ ] Depoyu `heraklessii/MuiLabs` olarak aç, Pages'i çalıştır
      → **İlker'in yapması gerekiyor** (GitHub hesabı işi). Depo açılınca
      `.github/workflows/pages.yml` kendiliğinden çalışıyor, ek ayar yok.
- [ ] Muiget kararlı sürüme geçince `allowPrerelease`ı kaldır
      → **dış olay bekliyor.** 2026-09-03 kontrolü: v0.1.0–v0.1.5, altısı da
      hâlâ prerelease. Bayrak yerinde kalmalı.

### Faz 4'te bilerek yapılmayanlar

- **Ekran görüntüsü yalnız Muiget'te var.** Muivly ve Muifly'nin deposunda
  arayüz karesi yok; Muitoon'unkiler ya lisanslı webtoon sayfası içeriyor ya
  da henüz yayınlanmamış mobil uygulamaya ait. Kural ve gerekçeler
  `docs/apps-registry.md` → "Ekran Görüntüsü Kuralları". Kare çıkınca tek
  satırlık config değişikliği yetiyor.
- **Sürüm notlarının metni gösterilmiyor.** Markdown ayrıştırıcı bağımlılığı
  eklemeye değmedi; her satır kendi GitHub sayfasına gidiyor.
- **JS tarafında test altyapısı kurulmadı.** Depoda vitest/jest yok, Faz 4
  kapsamı da değildi. `rotayiCoz` saf bir fonksiyon, ileride test yazılacaksa
  başlanacak yer orası.

## Yayınlanınca Buraya Dönülecek (bekleyen dış olaylar)
- [ ] Muitoon mobil Play Store'a çıkınca → `playStoreUrl` eklenir
- [ ] Muifly demo release'i yayınlanınca → kart kendiliğinden "Demo (Windows)"
      gösterir, kod değişikliği gerekmez
- [ ] Muifly Steam/itch sayfaları açılınca → `links` doldurulur
- [ ] Muita public demosu çıkınca → `coming_soon`dan çıkarılır
- [ ] Muiren (Discord müzik botu) listeye girecek mi? — karar verilmedi

## Şu An Neredeyiz

**Faz 0-4 bitti.** Vitrin hem tarayıcıda hem Tauri penceresinde çalışıyor,
canlı GitHub verisi çekiyor, ürün detay sayfaları ve sosyal önizleme kartı
hazır. `npm run build`, `VITRIN=1 npm run build` ve `cargo test` geçiyor.

Kodda planlanmış iş kalmadı. Kalan iki madde koda değil dünyaya bağlı:

1. **Depoyu GitHub'a aç** (İlker). Bu yapılana kadar Pages adresi yok, yani
   `og:image` ve `canonical` etiketlerindeki
   `https://heraklessii.github.io/MuiLabs/` adresi de henüz cevap vermiyor.
2. **Muiget kararlı sürüme geçsin** — o zaman `allowPrerelease` kalkar.

Bunlar dışındaki her şey "Yayınlanınca Buraya Dönülecek" listesinde ve
hiçbiri kod değişikliği gerektirmiyor; config'e bir alan eklemekten ibaret.
