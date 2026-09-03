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
- [x] Depo `heraklessii/MuiLabs` olarak public açıldı, Pages çalışıyor →
      https://heraklessii.github.io/MuiLabs/ (2026-09-03)
- [ ] Muiget kararlı sürüme geçince `allowPrerelease`ı kaldır
      → **dış olay bekliyor.** 2026-09-03 kontrolü: v0.1.0–v0.1.5, altısı da
      hâlâ prerelease. Bayrak yerinde kalmalı.
- [ ] GitHub'ın depo önizleme görselini yükle (Settings → General → Social
      preview → `public/social-preview.png`) → **elle yapılacak**, REST API'si
      yok. Sayfanın `og:image`'i zaten çalışıyor; bu yalnız GitHub depo
      sayfasının kartı için.

### Faz 4'te bilerek yapılmayanlar

- **Ekran görüntüsü yalnız Muiget'te var.** Muivly ve Muifly'nin deposunda
  arayüz karesi yok; Muitoon'unkiler ya lisanslı webtoon sayfası içeriyor ya
  da henüz yayınlanmamış mobil uygulamaya ait. Kural ve gerekçeler
  `docs/apps-registry.md` → "Ekran Görüntüsü Kuralları". Kare çıkınca tek
  satırlık config değişikliği yetiyor.
- **Sürüm notlarının metni gösterilmiyor.** Markdown ayrıştırıcı bağımlılığı
  eklemeye değmedi; her satır kendi GitHub sayfasına gidiyor.
## Faz 5 — Sertleştirme ve ilk sürüm ✅ (2026-09-03)

- [x] **TS tarafına test eklendi** (`vitest`, 37 test). Rust'ın testleri vardı,
      TypeScript'in hiç yoktu — oysa en riskli parça oradaydı: yanlış asset
      eşleşmesi sessiz bir hata, buton çalışır ve kullanıcı çalıştıramadığı
      bir dosya alır. `asset-match.test.ts` gerçek config desenleriyle
      çalışıyor; Muiget'in windows deseninden `$` çıpası düşürülünce üç test
      birden kırmızıya dönüyor (mutasyonla doğrulandı).
- [x] **`validateApps` CI'da zorunlu.** Denetim üretimde hiç çalışmıyor,
      geliştirmede yalnız konsola yazıyordu; kimse konsola bakmazsa bozuk bir
      kayıt sessizce yayına gidebilirdi.
- [x] **Masaüstü sürümü Faz 4 değişiklikleriyle çalıştırıldı.** Detay sayfası,
      hash yönlendirme ve önizleme bantları `tauri://localhost` altında
      doğrulandı — o zamana kadar yalnız tarayıcıda denenmişti.
- [x] `npm run tauri build` → NSIS (2,1 MB) + MSI (2,7 MB)
- [x] **v0.1.0 yayınlandı.**

## Yayınlanınca Buraya Dönülecek (bekleyen dış olaylar)
- [ ] Muitoon mobil Play Store'a çıkınca → `playStoreUrl` eklenir
- [ ] Muifly demo release'i yayınlanınca → kart kendiliğinden "Demo (Windows)"
      gösterir, kod değişikliği gerekmez
- [ ] Muifly Steam/itch sayfaları açılınca → `links` doldurulur
- [ ] Muita public demosu çıkınca → `coming_soon`dan çıkarılır
- [ ] Muiren (Discord müzik botu) listeye girecek mi? — karar verilmedi

## Şu An Neredeyiz

**Faz 0-5 bitti. Vitrin yayında, ilk sürüm çıktı.**

- Web: https://heraklessii.github.io/MuiLabs/
- Masaüstü: https://github.com/heraklessii/MuiLabs/releases/tag/v0.1.0

`npm test` (37), `npm run build`, `VITRIN=1 npm run build` ve `cargo test`
geçiyor; CI, Pages ve release iş akışları çalışır durumda.

Kodda planlanmış iş kalmadı. Kalan her şey dış olay bekliyor ve hiçbiri kod
değişikliği gerektirmiyor — config'e bir alan eklemekten ibaret (aşağıdaki
liste). Tek istisna `allowPrerelease`: Muiget kararlı sürüme geçince
`apps.config.ts`'ten kaldırılacak.

Elde kalan işler:

- GitHub'ın depo önizleme görselini Settings'ten yükle (yukarıda).
- **Kod imzalama sertifikası.** Paketler imzasız; Windows SmartScreen
  "bilinmeyen yayıncı" uyarısı veriyor. Sürüm notlarında açıkça yazıyor ama
  kalıcı çözüm sertifika. Muiget/Muivly'de de aynı durum — aile geneli bir
  karar, MuiLabs'a özel değil.
