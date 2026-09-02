# MuiLabs

**Mui ailesinin bütün uygulamaları tek yerde.**

MuiLabs bir vitrin: Muiget, Muivly, Muifly, Muitoon ve Muita'yı listeler,
işletim sistemini algılar ve doğru kurulum dosyasını tek tıkla indirir. Web
sitesi olan ürünler için siteye, mağazada satılanlar için mağazaya götürür.

Aynı arayüz iki yerde çalışır: **Tauri masaüstü uygulaması** ve **GitHub Pages
üzerinde statik site**. İki ayrı frontend yok.

## Ne yapar

- Sürüm bilgisini **her açılışta doğrudan GitHub'dan** okur — burada saklanan
  bir kopya yok, gördüğün sürüm o andaki sürüm
- Windows/macOS/Linux algılar, o platformun kurulum dosyasını indirir;
  algılayamazsa üçünü de eşit ağırlıkta gösterir, tahmin etmez
- Ön sürüm (prerelease) olan paketleri **ön sürüm diye işaretler**
- Her ürünün detay sayfasında ne yaptığını, varsa ekran görüntüsünü ve
  gerçek tarih/boyutlarıyla sürüm geçmişini gösterir
- Olmayan bir mağaza sayfası için tıklanan ama hiçbir yere gitmeyen buton
  üretmez; olmayan bir ekran görüntüsünün yerine temsilî resim koymaz

## Ürünler

| Ürün | Ne | Dağıtım |
|---|---|---|
| [Muiget](https://github.com/heraklessii/Muiget) | Açık kaynak indirme yöneticisi | GitHub Releases (Windows/macOS/Linux) |
| [Muivly](https://github.com/heraklessii/Muivly) | Hafif canlı duvar kâğıdı motoru | GitHub Releases (Windows) |
| [Muifly](https://github.com/heraklessii/Muifly) | Oyun performans aracı | Mağaza (hazırlanıyor) + demo |
| [Muitoon](https://muitoon.com) | Webtoon okuma platformu | Web |
| Muita | Henüz duyurulmadı | — |

Muiget ve Muivly açık kaynak ve ücretsizdir (Apache-2.0). Muifly ticari bir
üründür.

## Geliştirme

```bash
npm install
npm run dev              # vitrin, http://localhost:1420
npm run tauri dev        # masaüstü penceresi
```

Derleme:

```bash
npm run build            # Tauri icin (kok yol)
VITRIN=1 npm run build   # GitHub Pages icin (/MuiLabs/ alt yolu)
npm run tauri build      # Windows kurulum paketleri
```

Rust tarafı:

```bash
cd src-tauri && cargo test
```

## Yeni ürün eklemek

`src/config/apps.config.ts` dosyasına bir kayıt eklemek yeterli — arayüz
`distribution.type`'a göre doğru davranışı kendisi seçer. Şema ve kontrol
listesi: [`docs/apps-registry.md`](docs/apps-registry.md).

İkonu `public/icons/` altına koy; ürünün kendi deposundaki favicon ile aynı
çizim olmalı.

Ekran görüntüsü varsa `public/screenshots/` altına koyup kayda `screenshots`
alanını ekle — ama önce
[kurallara](docs/apps-registry.md#ekran-görüntüsü-kuralları) bak: temsilî
görsel, üçüncü tarafa ait içerik ve henüz yayınlanmamış arayüz kabul edilmiyor.

Ürün sayısı değişince sosyal önizleme kartı eskir:
`tools/social-preview.html`'i güncelle ve PNG'yi yeniden üret (komut o dosyanın
başında).

## Belgeler

| Konu | Dosya |
|---|---|
| Ürün kayıt şeması, doğrulanmış repo/asset listesi | [`docs/apps-registry.md`](docs/apps-registry.md) |
| GitHub Releases entegrasyonu, prerelease tuzağı | [`docs/github-integration.md`](docs/github-integration.md) |
| Platform algılama | [`docs/platform-detection.md`](docs/platform-detection.md) |
| Tauri ↔ web ortam farkları | [`docs/dual-target-architecture.md`](docs/dual-target-architecture.md) |
| Tasarım jetonları, kart davranışları | [`docs/ui-conventions.md`](docs/ui-conventions.md) |
| Faz planı ve bekleyen dış olaylar | [`docs/roadmap.md`](docs/roadmap.md) |

## Tasarım

Renkler, tipografi ve ikon dili Mui ailesinden birebir geliyor: teal `#2dd4bf`
vurgu, koyu `#0f1115` zemin, gömülü Outfit. Kanonik kaynak Muiget'in
`src/styles.css` dosyası.

Yazı tipi Outfit, [SIL Open Font License 1.1](src/assets/fonts/LICENSE-OFL.txt)
ile dağıtılıyor ve uygulamaya gömülü — CDN'e çıkılmıyor.
