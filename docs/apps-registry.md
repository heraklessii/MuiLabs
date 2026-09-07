# Uygulama Kayıt Şeması (`apps.config.ts`)

> Bu dosyadaki bütün repo adları, asset isimleri ve link durumları
> **2026-09-03'te GitHub API'den doğrulandı**. Tahmin/placeholder yok.
> Bir değeri değiştirmeden önce gerçekten öyle olduğunu doğrula.

## Amaç

MuiLabs'a yeni bir Mui ürünü eklemek = bu dosyaya bir obje eklemek. UI bileşenleri
(`AppCard`, `AppDetail`) `distribution.type`'a göre otomatik doğru davranışı
(indirme butonu / mağaza linki / redirect / pasif kart) render eder.

## TypeScript Şeması

```typescript
type AppStatus = "live" | "demo" | "coming_soon";

/**
 * Platform başına desen listesi, ÖNCELİK SIRALI: ilk eşleşen asset kazanır.
 * Tek desen de yazılabilir. Liste olmasının sebebi gerçek bir durum:
 * Muivly release'inde hem `-setup.exe` hem `-portable.zip` var, kurulum
 * paketi tercih edilmeli.
 */
type PlatformAssetMatcher = {
  windows?: RegExp | RegExp[];
  mac?: RegExp | RegExp[];
  linux?: RegExp | RegExp[];
};

type GithubRelease = {
  type: "github_release";
  repo: string;                    // "heraklessii/Muiget"
  platformAssets: PlatformAssetMatcher;
  /**
   * true ise prerelease'ler de kabul edilir. Muiget için ZORUNLU —
   * bütün release'leri prerelease, `releases/latest` 404 döner.
   * Bkz. docs/github-integration.md → "latest tuzağı".
   */
  allowPrerelease?: boolean;
};

type Distribution =
  | GithubRelease
  | {
      type: "storefront";
      /** Sayfa yayına girene kadar alan yok — boş string YAZMA, alanı hiç koyma. */
      links: { itch?: string; steam?: string };
      demo?: GithubRelease;
    }
  | {
      type: "web_redirect";
      url: string;
    }
  | {
      type: "web_and_mobile";
      webUrl: string;
      playStoreUrl?: string;
      appStoreUrl?: string;
    }
  | {
      /**
       * Taşıyacak veri yok — bilerek. Config bundle'a giriyor; hiç
       * gösterilmeyen bir alan bile duyurulmamış bir ürünün depo adını
       * tarayıcıya taşırdı.
       */
      type: "coming_soon";
    };

/** Ürünün KENDİ arayüzünden gerçek bir kare. Kurallar aşağıda. */
interface Screenshot {
  src: string;   // public/screenshots/ altındaki dosya
  alt: string;   // gerçek içerik tarifi; "ekran görüntüsü" demek yetmez
}

interface MuiApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  status: AppStatus;
  distribution: Distribution;

  // --- Yalnız detay sayfasında kullanılır (Faz 4) ---

  /** Ürünün kendi README'sinden kısaltılmış maddeler. Pazarlama cümlesi üretme. */
  highlights?: string[];
  screenshots?: Screenshot[];
  /** "Apache-2.0" ya da "Kapalı kaynak, tek seferlik ücretli". */
  lisans?: string;
  /** Detaydaki "kaynak kodu" bağlantısı — yalnız PUBLIC ve gerçekten kaynak kodu olan depo. */
  publicRepo?: string;
}
```

Beş alanın da ortak kuralı: **veri yoksa alan hiç yazılmaz.** Detay sayfası boş
bölüm çizmiyor — `highlights` yoksa liste, `screenshots` yoksa galeri hiç
görünmüyor. "Ekran görüntüsü eklenmedi" gibi bir yer tutucu, olmayan şeyi
ekrana yazmak olur.

## Ekran Görüntüsü Kuralları

Bir kare `screenshots`a yalnız **üçü birden** doğruysa girer:

1. **Ürünün kendi arayüzü.** Temsilî görsel, konsept çizim, mockup olmaz.
2. **İçeriği bize ait.** Üçüncü tarafa ait materyal görünmez. Muitoon'un
   okuyucu kareleri bu yüzden kullanılmıyor: içlerinde lisanslı webtoon
   sayfaları var, MuiLabs deposu o içeriği taşımaz.
3. **Yayında olan bir şeyi gösterir.** Muitoon'un mobil uygulama kareleri de
   bu yüzden kullanılmıyor — o uygulama henüz yayınlanmadı, kullanıcı
   indiremeyeceği bir arayüzü görmemeli.

Bugün yalnız Muiget'in bir karesi var (`public/screenshots/muiget-liste.png`,
kaynağı `..\Muiget\docs\ekran-goruntusu.png`; alt kenarındaki başka bir
pencereden sızmış metin şeridi kırpıldı). Diğerleri kartta ve detayda ürünün
kendi ikonundan üretilen nötr bir bant görüyor.

Yeni bir kare eklemek: dosyayı `public/screenshots/` altına koy, kayda
`screenshots` alanını ekle. Başka kod değişikliği gerekmiyor.

## Doğrulanmış Repo Durumu

| Ürün | Repo | Görünürlük | Release durumu |
|---|---|---|---|
| Muiget | `heraklessii/Muiget` | public | v0.1.5 — **tümü prerelease** |
| Muivly | `heraklessii/Muivly` | public | v0.2.0 — normal release |
| Muiply | `heraklessii/Muiply` | public | v0.1.0 — **prerelease** |
| Muifly | `heraklessii/Muifly` (vitrin) | public | **hiç release yok** (demo henüz çıkmadı) |
| Muita | (private depo) | **private** | — |
| Muitoon | GitHub'da public repo yok | — | web: https://muitoon.com |

Muifly'nin asıl geliştirme deposu ayrı ve private'tır; MuiLabs ondan haberdar
olmamalı, yalnız public vitrin/demo deposunu bilir.

Private depoların adları bu depoda **yazılmıyor** — ne dokümanda ne config'de.
MuiLabs public ve config bundle'a giriyor; hiç gösterilmeyen bir alan bile o
adı tarayıcıya taşır. Bir private deponun adına ihtiyacın olursa İlker'e sor.

## Mevcut Kayıtlar

Kayıtların tamamı tek yerde: [`src/config/apps.config.ts`](../src/config/apps.config.ts).

Bu doküman kayıtların bir **kopyasını tutmuyor** — bilerek. Kopya tutulduğu
sürece er geç ikisi ayrışıyor ve okuyan hangisinin doğru olduğunu bilemiyor.
Yukarıdaki şema, kurallar ve doğrulanmış repo tablosu burada; değerlerin
kendisi koddadır ve gerekçeleri satır içi yorumlarda yazılıdır.

## Ürün Metinlerinde Dil Kuralları

- **Muifly için "açık kaynak" / "open source" ifadesi hiçbir metinde
  kullanılmaz.** Ücretli ve kapalı kaynak; şeffaflığı çalışma zamanı
  şeffaflığıdır. Kullanılacak dil: "ne yaptığını gösteren", "geri alınabilir".
- Muiget ve Muivly açık kaynak ve ücretsiz (Apache-2.0) — bu vurgulanabilir.
- "Mui projeleri açık kaynaktır" gibi genel bir cümle yazma, doğru değil.

## Yeni Ürün Eklerken Kontrol Listesi

1. `id` benzersiz ve kebab-case
2. `icon` dosyası `public/icons/` altına eklendi mi?
3. `status` ile `distribution.type` tutarlı mı? (bkz. `docs/ui-conventions.md`)
4. `github_release` ise: repo **public** mi, en az bir release var mı, ve
   release'ler prerelease ise `allowPrerelease: true` konuldu mu?
5. Asset desenleri `.sha256` / `.sig` gibi yan dosyaları yakalamıyor mu?
   (`$` ile bitir, `\.exe` gibi ortada bırakma)
6. Link alanları: yayında olmayan mağaza/store için alanı **hiç yazma**,
   boş string koyma — UI `undefined` üzerinden "hazırlanıyor" gösterir.
7. `highlights` yazıldıysa maddeler ürünün **kendi** README'sinden mi geliyor?
   Buraya pazarlama cümlesi yazılmaz.
8. `screenshots` yazıldıysa yukarıdaki üç kuralı da geçiyor mu?
9. `publicRepo` yalnız gerçekten kaynak kodu barındıran public depo için.
   Muifly'nin vitrin deposu buna girmez — o depoda kaynak kod yok, ürün
   kapalı kaynak.
10. Sosyal önizleme kartındaki ürün sayısı artık eskidi:
    `tools/social-preview.html`'i güncelleyip PNG'yi yeniden üret (komut o
    dosyanın içinde).
