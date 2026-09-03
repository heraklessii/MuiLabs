# MuiLabs — Proje Belleği

Mui portföyünün vitrin/launcher uygulaması. Tüm Mui ürünlerinin listelendiği,
indirilebildiği veya ilgili mağaza/platforma yönlendirildiği tek nokta.

## Ne İnşa Ediyoruz (özet)

- **Tauri v2 + React/Vite/TypeScript** masaüstü uygulaması
- **Aynı frontend** GitHub Pages'te statik web sürümü olarak da yayınlanır
- Uygulama listesi tek bir config dosyasından (`apps.config.ts`) beslenir —
  yeni Mui ürünü eklemek bu dosyaya bir kayıt eklemekten ibarettir
- GitHub'daki ücretsiz ürünler için **client-side canlı** release/asset takibi
  (build-time fetch YOK, cache YOK — kullanıcı açtığında GitHub API'den çeker)

## Okuma Tetikleyici Tablosu

Her session'da her dosyayı okumaya gerek yok. Aşağıdaki tabloya göre ilerle:

| Yapılacak iş | Önce oku |
|---|---|
| Yeni Mui uygulaması ekleme/düzenleme | `docs/apps-registry.md` |
| Platform algılama / indirme davranışı (Tauri vs web) | `docs/platform-detection.md` |
| GitHub Releases API entegrasyonu, asset eşleştirme | `docs/github-integration.md` |
| Tauri ↔ Web ortam farkları, guard mantığı | `docs/dual-target-architecture.md` |
| UI/kart tasarımı, status badge'leri | `docs/ui-conventions.md` |
| Genel proje durumu / hangi fazdayız | `docs/roadmap.md` |
| Sadece bugfix / küçük stil değişikliği | Hiçbiri — direkt koda bak |

## Kritik Kararlar (asla unutulmasın)

1. **Tek config, çoklu dağıtım tipi.** `apps.config.ts` içindeki `distribution`
   alanı discriminated union: `github_release | storefront | web_redirect |
   web_and_mobile | coming_soon`. Yeni bir dağıtım şekli gerekirse union'a
   eklenir, UI bileşenleri buna göre dallanır.
2. **Muitoon Collector (Chrome eklentisi) burada YOK.** MuiLabs sadece son
   kullanıcıya yönelik ürünleri listeler, geliştirici araçlarını değil.
3. **GitHub API çağrıları client-side, canlı, cache'siz.** Unauthenticated
   rate limit (60/saat/IP) bu ölçekte sorun değil. Build-time fetch veya
   backend cache'i EKLEME — kasıtlı karar.
4. **Platform algılama → otomatik doğru asset indirme.** Kullanıcıya "hangi
   dosyayı indireceğim" sorusu sormuyoruz; Windows/Mac/Linux algılanıp doğru
   release asset'i direkt indiriliyor (Tauri: native indirme, Web: browser
   indirme tetikleme).
5. **Muita henüz `coming_soon` durumda.** Deposu var ama private — MuiLabs
   ondan sürüm çekemez, link de göstermez. Sadece kart olarak görünür,
   tıklanamaz/pasif. **Depo adı bu depoda hiçbir yerde yazılmaz:** MuiLabs
   public ve config bundle'a giriyor, hiç gösterilmeyen bir alan bile o adı
   tarayıcıya taşır. Aynısı Muifly'nin private geliştirme deposu için de
   geçerli. Adına ihtiyacın olursa İlker'e sor.
6. **`docs/` klasörü başlangıçta web Claude'a hazırlatıldı, bazı değerleri
   uydurmaydı.** 2026-09-03'te repo adları, release durumları ve asset
   isimleri GitHub API'den doğrulanıp düzeltildi. Bir link/repo/asset adına
   ihtiyacın olursa önce `docs/apps-registry.md`'ye bak; orada yoksa
   **uydurma** — doğrula ya da İlker'e sor.
7. **Tasarım dili kardeş projelerden birebir devralınır.** Teal `#2dd4bf`
   vurgu, koyu `#0f1115` zemin, gömülü Outfit. Kanonik kaynak
   `..\Muiget\src\styles.css`; jeton listesi `docs/ui-conventions.md`.
8. **Yönlendirme hash'te, router kütüphanesi yok.** `#/uygulama/<id>`. Yol
   segmenti (`/uygulama/muiget`) Pages'te 404 olurdu ve Tauri'nin
   `tauri://localhost` kökünde de karşılığı yok; hash sunucuya hiç gitmiyor.
   İki ekran için bağımlılık eklenmedi.
9. **Ekran görüntüsü uydurulmaz.** Bir kare `screenshots`a ancak ürünün kendi
   arayüzüyse, içeriği bize aitse ve yayında olan bir şeyi gösteriyorsa girer
   (bkz. `docs/apps-registry.md`). Bugün yalnız Muiget'in bir karesi var;
   diğerleri ikondan üretilen nötr bant görüyor. Temsilî görsel KOYMA.

## Mevcut Mui Ürünleri ve Dağıtım Tipleri

Repo sahibi: **`heraklessii`** (İlker'in kendisi).

| Ürün | Status | Dağıtım | Bugünkü gerçek durum |
|---|---|---|---|
| Muiget (indirme yöneticisi) | live | `github_release` | `heraklessii/Muiget`, public, v0.1.5 — **tümü prerelease** |
| Muivly (live wallpaper) | live | `github_release` | `heraklessii/Muivly`, public, v0.2.0, **yalnız Windows** |
| Muifly (oyun perf. aracı) | demo | `storefront` + demo release | Vitrin repo `heraklessii/Muifly` public; **Steam/itch sayfası ve demo release'i henüz YOK** |
| Muitoon (webtoon platformu) | live | `web_and_mobile` | https://muitoon.com canlı; mobil **Play Store'da değil** — link gösterilmez |
| Muita | coming_soon | `coming_soon` | Deposu **private**, adı burada yazılmaz; ileride public demo |

Detaylar ve şema için `docs/apps-registry.md`.

## Kod Konumu

- `src/config/apps.config.ts` — tüm ürün kayıtları + `validateApps()`
- `src/lib/github.ts` — GitHub Releases istemcisi (`/releases` listesi, prerelease
  destekli, eşzamanlı istekleri birleştiriyor)
- `src/lib/platform.ts` — Tauri/Web + OS algılama; `isTauri()` burada
- `src/lib/asset-match.ts` — öncelik sıralı platform ↔ asset eşleştirme
- `src/lib/actions.ts` — `indir()`, `disLinkAc()`, `varlikYolu()`; ortam farkı burada bitiyor
- `src/lib/route.ts` — `#/uygulama/<id>` hash rotası (router kütüphanesi YOK)
- `src/components/AppActions.tsx` — beş dağıtım tipinin aksiyon bileşenleri;
  kart ve detay sayfası ikisi de bunu kullanıyor
- `src/components/AppCard.tsx` — kart + önizleme bandı + gerilmiş bağlantı
- `src/components/AppDetail.tsx` — detay sayfası + sürüm geçmişi
- `src/styles.css` — Mui jetonları, gömülü Outfit
- `public/icons/` — ürün ikonları (her biri ilgili ürünün favicon'uyla aynı çizim)
- `public/screenshots/` — gerçek arayüz kareleri (kurallar: `docs/apps-registry.md`)
- `tools/social-preview.html` — `public/social-preview.png`'in kaynağı; yeniden
  üretme komutu dosyanın içinde
- `src-tauri/src/` — `platform.rs` (OS), `download.rs` (indirme + güvenlik testleri),
  `lib.rs` (`open_external` + komut kaydı)

Testler (`vitest`, dosyalar kaynağın yanında `*.test.ts`):

- `src/lib/asset-match.test.ts` — **en kritik olanı.** Gerçek config desenleri
  ve gerçek asset adlarıyla çalışır; deseni gevşetmek (`$` çıpasını düşürmek
  gibi) burayı düşürür. Yanlış eşleşme sessiz bir hata: buton çalışır,
  kullanıcı çalıştıramadığı bir dosya alır.
- `src/config/apps.config.test.ts` — `validateApps` üretimde çalışmıyor,
  geliştirmede yalnız konsola yazıyor; denetimi zorunlu kılan yer burası.
- `src/lib/route.test.ts`, `src/lib/github.test.ts`

Komutlar: `npm run dev` · `npm run tauri dev` · `npm test` · `npm run build` ·
`VITRIN=1 npm run build` (Pages, `/MuiLabs/` base) · `cd src-tauri && cargo test`
