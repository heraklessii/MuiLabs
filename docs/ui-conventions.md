# UI Konvansiyonları

## Görsel Yön — Mui tasarım dili (tahmin yok, kopyala)

MuiLabs, diğer Mui ürünleriyle **aynı** tasarım dilini konuşur. Kanonik kaynak:
`..\Muiget\src\styles.css`. Tanıtım sayfası alt seti için `..\Muivly\site\index.html`.

Koyu tema jetonları:

```css
--bg: #0f1115;          --bg-panel: #181b22;    --bg-elevated: #20242d;
--bg-sunken: #0b0d11;   --border: #262b35;      --border-strong: #333a47;
--text: #e8eaed;        --text-muted: #8b93a3;
--accent: #2dd4bf;      --accent-strong: #5eead4;
--accent-soft: rgb(45 212 191 / 12%);   --accent-line: rgb(45 212 191 / 34%);
--on-accent: #04211d;   /* teal AÇIK bir renk: üstündeki yazı koyu olmak zorunda */
--radius: 12px;         --radius-lg: 16px;      --radius-pill: 999px;
```

Açık temada accent koyu uca kayar (`--accent: #0d9488`, `--on-accent: #ffffff`);
tam set `styles.css` içinde.

Yazı tipi **Outfit**, woff2 dosyaları **gömülü** (CDN yok). `latin-ext` alt kümesi
Türkçe için şart (ğ ş İ ı Ş Ğ). Dosyalar `..\Muivly\site\fonts\` altından
kopyalanır.

Kural: bileşen kodunda renk/ölçü sabiti yazılmaz, hepsi bu değişkenlerden gelir.

## Ana Görünüm

Grid halinde `AppCard` bileşenleri. Her kart:
- Üstte 16:9 önizleme bandı
- İkon + isim + tagline
- Status badge (adın yanında)
- Ana aksiyon butonu (dağıtım tipine göre değişir)

### Önizleme bandı

Her kartta **var ve aynı yükseklikte** — birinin bandı olup diğerininki
olmayınca ızgarada bütün satır kayıyor. İçeriği ikiye ayrılıyor:

| Durum | Ne çizilir |
|---|---|
| `screenshots[0]` var | Görsel, `object-fit: cover`, `object-position: top` (arayüz görüntülerinde anlamlı olan üst kısım) |
| Yok | Ürünün kendi ikonu, soluk, teal yıkamalı zeminde |

İkinci hâl bilerek **soyut**. Temsilî bir arayüz resmi koymak, göstermediğimiz
bir şeyi göstermiş gibi yapmak olurdu; hangi karenin `screenshots`a girebileceği
`docs/apps-registry.md`'de kurala bağlı.

### Kart tıklanabilirliği

Kartın **tamamı** detay sayfasına götürür ama kart bir `<a>` DEĞİL: içinde
indirme butonları var, iç içe tıklanabilir öğe hem geçersiz HTML hem de ekran
okuyucuda tek bir dev bağlantı demek. Bunun yerine ürün adı bağlantı ve
`.kart-baglanti::after` kartı kaplıyor ("stretched link"); `.kart-aksiyon`
`z-index: 1` ile kaplamanın üstünde kalıyor, böylece indirme butonuna basmak
detay sayfasını açmıyor.

`coming_soon` kartlarında bağlantı **hiç çizilmiyor** — detay sayfasında
gösterilecek bir şey yok.

## Status Badge Renkleri

| Status | Etiket (TR) | Jeton |
|---|---|---|
| `live` | Yayında | `--accent` (teal) |
| `demo` | Demo | `--warning` (#fbbf24) |
| `coming_soon` | Yakında | `--text-muted`, kart soluk/pasif |

## Dağıtım Tipine Göre Ana Buton

| `distribution.type` | Buton davranışı |
|---|---|
| `github_release` | "İndir (Windows)" — algılanan platforma göre, bkz. `docs/platform-detection.md`. Sürüm etiketi butonun altında; prerelease ise yanında "ön sürüm" rozeti |
| `storefront` | Mağaza linkleri yan yana — **ama yalnız `links` içinde gerçekten olan alanlar için**. Bugün Muifly'de hiç link yok: "Mağaza sayfası hazırlanıyor" metni gösterilir, buton değil. Altında `demo` varsa "Demo indir" |
| `web_redirect` | "Aç" → yeni sekmede `url` |
| `web_and_mobile` | "Web'de Aç" birincil. `playStoreUrl` **yoksa** Play Store butonu hiç render edilmez (bugün Muitoon böyle) — "yakında Play Store'da" gibi bir vaat de yazılmaz |
| `coming_soon` | Buton yok, kart tıklanamaz, opacity düşük, detay sayfası yok. Depo bağlantısı **hiç** gösterilmez — depo private |

Genel kural: **olmayan bir link için placeholder buton üretme.** Alan `undefined`
ise o eleman hiç çizilmez ya da nötr bir bilgi metnine dönüşür.

## "Release yok" ≠ "Yakında"

`github_release` kaydı için API `null` dönerse (repo public, henüz paket yok —
bugün Muifly demosu), kart `coming_soon` gibi görünmez. Ürün gerçek, paketi
hazır değil: "Henüz sürüm yayınlanmadı" + repo linki.

## Tutarlılık Kontrolleri (dev modda `validateApps()`)

- `status: "coming_soon"` ise `distribution.type` de `"coming_soon"` OLMALI
- `status: "live"` iken `distribution.type: "coming_soon"` olması da hata
- `github_release` kaydında `repo` "sahip/ad" formatında olmalı
- Link alanları boş string OLMAMALI — yoksa alan hiç yazılmaz (boş string,
  UI'da tıklanınca hiçbir yere gitmeyen buton üretir)
- Bu kontroller `console.error` basar, production build'i kırmaz

## Detay Sayfası

Adres hash'te: `#/uygulama/<id>` (`src/lib/route.ts`). Yol segmenti
kullanılmıyor çünkü Pages'te `/uygulama/muiget` düpedüz 404 olurdu; hash
sunucuya hiç gitmiyor ve Tauri'de de aynı çalışıyor. Router kütüphanesi yok.

Düzen iki sütun (`max-width: 860px` altında tek sütun):

| Sol sütun | Sağ sütun (yapışkan) |
|---|---|
| Tam açıklama (kırpılmadan) | Aksiyon bloğu |
| `highlights` → "Ne yapar" | Künye: lisans, kaynak kodu |
| `screenshots` → "Ekrandan" | |
| Sürüm geçmişi | |

Kurallar:

- **Aksiyon bloğu kartla AYNI bileşen** (`AppActions.tsx`). İki ekranın farklı
  şey söylemesi imkânsız olsun diye: kartta "indir" derken detayda "yakında"
  diyen bir vitrin, hangisinin doğru olduğunu kullanıcıya sordurur.
- **Boş bölüm çizilmez.** Alan yoksa başlık da yok.
- **Sürüm geçmişi ön sürümleri ayıklamaz** (kart ayıklıyor): geçmiş, olanı
  gösterdiği için işe yarıyor. Her satır kendi GitHub sayfasına gidiyor.
- **Sürüm notlarının metni gösterilmiyor.** GitHub gövdeleri Markdown; doğru
  çizmek bir ayrıştırıcı bağımlılığı ister, ham basmak notu okunaksız yapar.
- Dar ekranda aksiyon bloğu **öne** alınıyor (`order: -1`) — indirme butonunu
  sürüm geçmişinin altına atmak, sayfaya gelen herkesi kaydırmaya zorlar.
- Çıkış yolları üç tane: "Bütün uygulamalar" düğmesi, üstteki marka, `Escape`.
  `history.back()` kullanılmıyor — kullanıcı detaya doğrudan bir bağlantıyla
  gelmiş olabilir, o zaman geri gidecek bir yer yok.

## Sosyal Önizleme Görseli

`public/social-preview.png`, kaynağı `tools/social-preview.html`. Headless
Edge ile 1280×640 raster üretiliyor (komut kaynak dosyanın içinde) — hem
`og:image` hem GitHub'ın depo önizlemesi raster istiyor, SVG kabul etmiyor.
Aynı yöntem `..\Muivly\site\social-preview.html` içinde de kullanılıyor.

Kaynağı depoda tutmanın sebebi: karttaki sayı (bugün "5 uygulama")
eskidiğinde yeniden üretilebilsin. Kimsenin yeniden üretemediği bir önizleme
görseli, yavaş yavaş yalan söylemeye başlayan bir görseldir.
