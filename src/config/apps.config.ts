/**
 * Mui ürün kayıtları — MuiLabs'ın tek veri kaynağı.
 *
 * Yeni bir Mui ürünü eklemek = bu dosyaya bir obje eklemek. UI bileşenleri
 * `distribution.type`'a göre doğru davranışı kendisi seçer; kart kodunda
 * ürün adına göre özel durum YOK.
 *
 * Buradaki repo adları, asset desenleri ve link durumları uydurma değil —
 * GitHub API'den doğrulandı (bkz. docs/apps-registry.md). Bir alanı
 * değiştirmeden önce gerçekten öyle olduğunu doğrula; olmayan bir mağaza
 * sayfası için placeholder link YAZMA, alanı hiç koyma.
 */

export type AppStatus = "live" | "demo" | "coming_soon";

export type Platform = "windows" | "mac" | "linux";

/**
 * Platform başına desen listesi, ÖNCELİK SIRALI: ilk eşleşen asset kazanır.
 * Tek desen de yazılabilir.
 *
 * Liste olmasının sebebi gerçek bir durum: Muivly release'inde hem
 * `-setup.exe` hem `-portable.zip` var, kurulum paketi tercih edilmeli.
 *
 * Desenler `$` ile biter. Release'lerde kullanıcıya verilmemesi gereken yan
 * dosyalar da asset olarak duruyor (`.sha256`, güncelleyicinin
 * `.app.tar.gz`'si); `/\.exe/` gibi ucu açık bir desen
 * `Muivly-0.2.0-setup.exe.sha256` dosyasını da yakalar.
 */
export type PlatformAssetMatcher = Partial<Record<Platform, RegExp | RegExp[]>>;

export interface GithubRelease {
  type: "github_release";
  /** "sahip/ad" — repo public OLMALI, private repo'dan sürüm çekilemez. */
  repo: string;
  platformAssets: PlatformAssetMatcher;
  /**
   * true ise prerelease'ler de kabul edilir.
   *
   * Muiget için ZORUNLU: v0.1.5 dâhil bütün release'leri prerelease olduğu
   * için `releases/latest` ucu 404 döner ve ürün "sürüm yok" görünür.
   * Bkz. docs/github-integration.md → "latest tuzağı".
   */
  allowPrerelease?: boolean;
}

export type Distribution =
  | GithubRelease
  | {
      type: "storefront";
      /** Sayfa yayına girmeden alan YAZILMAZ — boş string tıklanan ama hiçbir yere gitmeyen buton üretir. */
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
      /*
       * Yakında olan ürünün taşıyacak verisi yok — bilerek.
       *
       * Eskiden burada `privateRepo` diye bir alan vardı ve UI onu hiç
       * kullanmıyordu (private depoya link vermek kullanıcıyı 404'e yollamak
       * olur). Ama config bundle'a giriyor: hiç gösterilmeyen bir alan bile,
       * henüz duyurulmamış bir ürünün depo adını tarayıcıya taşıyordu.
       * Gösterilmeyecek veriyi hiç taşımamak, gösterilmemesine güvenmekten
       * güvenli.
       */
      type: "coming_soon";
    };

/**
 * Ürünün kendi arayüzünden gerçek bir görüntü.
 *
 * "Gerçek" burada şart: temsilî görsel, konsept çizim ya da başka bir üründen
 * alınmış kare KOYULMAZ. Vitrin kullanıcıya indireceği şeyin nasıl göründüğünü
 * söz veriyor; söz tutulmuyorsa görselin hiç olmaması daha iyi.
 *
 * Üçüncü tarafa ait içerik (Muitoon okuyucusundaki lisanslı webtoon karesi
 * gibi) görünen kareler de KULLANILMAZ — MuiLabs deposu o içeriği dağıtmaz.
 */
export interface Screenshot {
  /** public/screenshots/ altındaki dosya. `varlikYolu()` ile sarılır. */
  src: string;
  /** Ekran okuyucu için gerçek içerik tarifi; "ekran görüntüsü" demek yetmez. */
  alt: string;
}

export interface MuiApp {
  id: string;
  name: string;
  /** Kart başlığının altındaki tek satır. Nokta ile bitmez. */
  tagline: string;
  /** Kartın gövdesi. Üç satırda kesiliyor, ilk cümle en önemlisi olmalı. */
  description: string;
  /** public/icons/ altındaki dosya. Yol base-aware değil, `ikonYolu()` ile sar. */
  icon: string;
  status: AppStatus;
  distribution: Distribution;

  /* ---- Aşağıdakiler yalnız detay sayfasında kullanılır (Faz 4) ---- */

  /**
   * Detay sayfasındaki madde listesi. Kaynağı ürünün KENDİ README'si —
   * pazarlama cümlesi üretilmez, olan özellik kısaltılarak yazılır.
   * Yoksa alan hiç konmaz, sayfa o bölümü çizmez.
   */
  highlights?: string[];
  /**
   * Ekran görüntüleri. Yoksa alan konmaz: kart ve detay sayfası ürünün kendi
   * ikonundan üretilen nötr bir bant gösterir, sahte bir önizleme değil.
   */
  screenshots?: Screenshot[];
  /** "Apache-2.0" gibi. Kapalı kaynak ürünlerde de doğrusu yazılır. */
  lisans?: string;
  /** Detay sayfasındaki "kaynak kodu" bağlantısı — yalnız PUBLIC depo için. */
  publicRepo?: string;
}

export const apps: MuiApp[] = [
  {
    id: "muiget",
    name: "Muiget",
    tagline: "Açık kaynak indirme yöneticisi",
    description:
      "Segmentli HTTP indirme, duraklat/devam et, torrent ve tarayıcı uzantısıyla IDM alternatifi. Apache-2.0, ücretsiz.",
    icon: "icons/muiget.svg",
    status: "live",
    // Muiget/README.md → "Ne Yapar" bölümünden kısaltıldı.
    highlights: [
      "Dosyayı HTTP Range ile parçalara bölüp paralel indirir (varsayılan 8 parça)",
      "Uygulama kapansa, makine çökse bile indirme kaldığı yerden devam eder",
      "HLS/DASH video akışlarını parça parça alıp tek dosyada birleştirir",
      "Chrome, Edge ve Firefox uzantısıyla sağ tık → \"Muiget ile indir\"",
      "Kategori klasörleri, kuyruk, hız sınırı ve saat bazlı kurallar",
    ],
    screenshots: [
      {
        src: "screenshots/muiget-liste.png",
        alt: "Muiget'in indirme listesi: üç dosya, her birinin parça parça ilerleyen çubuğu, altta toplam hız",
      },
    ],
    lisans: "Apache-2.0",
    publicRepo: "https://github.com/heraklessii/Muiget",
    distribution: {
      type: "github_release",
      repo: "heraklessii/Muiget",
      allowPrerelease: true, // ZORUNLU — yukarıdaki nota bak
      platformAssets: {
        // Muiget_0.1.5_x64_en-US.msi, Muiget_0.1.5_x64-setup.exe
        windows: [/_x64_en-US\.msi$/i, /_x64-setup\.exe$/i],
        // Muiget_0.1.5_universal.dmg
        // (_universal.app.tar.gz güncelleyiciye ait, kullanıcıya verilmez)
        mac: /_universal\.dmg$/i,
        // Muiget_0.1.5_amd64.AppImage / _amd64.deb / Muiget-0.1.5-1.x86_64.rpm
        linux: [/_amd64\.AppImage$/i, /_amd64\.deb$/i, /\.x86_64\.rpm$/i],
      },
    },
  },
  {
    id: "muivly",
    name: "Muivly",
    tagline: "Hafif, düşük kaynaklı canlı duvar kâğıdı",
    description:
      "GPU decode ve zero-copy pipeline ile eski ve zayıf makinelerde de akıcı çalışan live wallpaper motoru. Apache-2.0, ücretsiz.",
    icon: "icons/muivly.svg",
    status: "live",
    // Muivly/README.md'deki ölçümler. Sayılar İlker'in makinesinde alındı ve
    // README'de de öyle yazıyor; "senin makinende de böyle olur" DENMEZ.
    highlights: [
      "Videoyu GPU'da çözer, monitörler arasında tek çözücü paylaşılır",
      "Her monitör bir pencereyle kapandığında çözme tamamen durur — ölçülen fark: bir çekirdeğin %13,7'sinden %0,4'üne",
      "Görüntü yirmi saniye görünmezse çözücüler de bırakılır, bellek onunla iner",
      "Telemetri, hesap, arka planda giden istek yok",
    ],
    lisans: "Apache-2.0",
    publicRepo: "https://github.com/heraklessii/Muivly",
    distribution: {
      type: "github_release",
      repo: "heraklessii/Muivly",
      platformAssets: {
        // Muivly-0.2.0-setup.exe (tercih), Muivly-0.2.0-portable.zip
        windows: [/-setup\.exe$/i, /-portable\.zip$/i],
        // mac/linux YOK: Muivly Windows'a özel (WorkerW, D3D11VA, Media Foundation).
      },
    },
  },
  {
    id: "muifly",
    name: "Muifly",
    tagline: "Windows oyun performans aracı",
    description:
      "Sistem, ağ ve ölçekleme ayarlarını tek araçta toplar; yaptığı her değişikliği gösterir ve tek tıkla geri alır.",
    icon: "icons/muifly.svg",
    status: "demo",
    // Muifly/README.md → "Ne yapar" bölümü.
    highlights: [
      "Öndeki oyunu algılar, önceliğini yükseltir, seçtiğin arka plan uygulamalarını dondurur (kapatmaz)",
      "DNS çözümleyicilerini gerçek sorgularla karşılaştırır; gecikme, jitter ve paket kaybını sürekli ölçer",
      "Kurulu Steam ve Epic oyunlarını senin diskinden okur — hangi oyunlara sahip olduğun hiçbir yere gönderilmez",
      "İsteğe bağlı ekran çevirisi bu bilgisayarda çalışır, metin dışarı çıkmaz",
      "Yaptığı her değişiklik günlüğe yazılır ve tek tıkla geri alınır",
    ],
    // Kaynak kod yayınlanmıyor; depo yalnız tanıtım ve demo dağıtımı için.
    lisans: "Kapalı kaynak, tek seferlik ücretli",
    distribution: {
      type: "storefront",
      // Steam ve itch.io sayfaları HENÜZ AÇILMADI. Link uydurma — alan boşken
      // kart "mağaza sayfası hazırlanıyor" diyor, tıklanacak bir şey vermiyor.
      links: {},
      demo: {
        type: "github_release",
        // Public vitrin/demo deposu. Asıl geliştirme deposu ayrı ve private;
        // MuiLabs ondan haberdar olmamalı.
        repo: "heraklessii/Muifly",
        platformAssets: { windows: [/-setup\.exe$/i, /\.msi$/i] },
      },
    },
  },
  {
    id: "muitoon",
    name: "Muitoon",
    tagline: "Sosyal okuma odaklı webtoon platformu",
    description:
      "Panel üstü yorumlar ve senkron beraber okuma odalarıyla manga ve webtoon okuma platformu.",
    icon: "icons/muitoon.svg",
    status: "live",
    // Muitoon/CLAUDE.md'de "ana farklılaştırıcılar" olarak geçen iki madde.
    highlights: [
      "Panel üstü yorumlar — yorum sayfaya değil, karenin üstündeki noktaya bırakılır",
      "Beraber okuma: aynı bölümü senkron ilerleyen odalar",
      "Tarayıcıda çalışır, kurulum istemez",
    ],
    // Ekran görüntüsü YOK: elimizdeki okuyucu kareleri lisanslı webtoon
    // sayfaları içeriyor, MuiLabs deposu o içeriği taşımaz. Mobil uygulamanın
    // kareleri de kullanılmaz — o uygulama henüz yayında değil.
    distribution: {
      type: "web_and_mobile",
      webUrl: "https://muitoon.com",
      // playStoreUrl YOK: mobil uygulama (com.muitoon.app) henüz yayınlanmadı.
      // Yayınlanınca eklenecek; o zamana kadar "yakında Play Store'da" gibi bir
      // vaat de yazmıyoruz.
    },
  },
  {
    id: "muita",
    name: "Muita",
    tagline: "Mui ailesinin yeni üyesi",
    // Ne olduğunu yazmıyoruz — henüz duyurulmadı. Kart yine de duruyor ki
    // aile eksik görünmesin.
    description: "Ayrıntılar hazır olunca burada görünecek.",
    icon: "icons/muita.svg",
    status: "coming_soon",
    distribution: {
      type: "coming_soon",
    },
  },
];

/**
 * Config tutarlılık denetimi.
 *
 * Dev modda `console.error` basar, production build'i KIRMAZ: bozuk bir kayıt
 * yüzünden kullanıcının vitrini bomboş açılmasın, geliştirici konsolda görsün.
 */
export function validateApps(list: MuiApp[] = apps): string[] {
  const hatalar: string[] = [];
  const gorulenIdler = new Set<string>();

  for (const app of list) {
    const nerede = `apps.config.ts → "${app.id}"`;

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(app.id)) {
      hatalar.push(`${nerede}: id kebab-case olmalı`);
    }
    if (gorulenIdler.has(app.id)) {
      hatalar.push(`${nerede}: id tekrar ediyor`);
    }
    gorulenIdler.add(app.id);

    const tip = app.distribution.type;

    // status ile dağıtım tipi birbirini tutmalı; tutmazsa kartın hangi butonu
    // göstereceği belirsiz kalır.
    if (app.status === "coming_soon" && tip !== "coming_soon") {
      hatalar.push(`${nerede}: status "coming_soon" ama distribution "${tip}"`);
    }
    if (app.status !== "coming_soon" && tip === "coming_soon") {
      hatalar.push(`${nerede}: distribution "coming_soon" ama status "${app.status}"`);
    }

    const repolar =
      tip === "github_release"
        ? [app.distribution.repo]
        : tip === "storefront" && app.distribution.demo
          ? [app.distribution.demo.repo]
          : [];

    for (const repo of repolar) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
        hatalar.push(`${nerede}: repo "sahip/ad" formatında değil → "${repo}"`);
      }
    }

    // Boş string bir link değil: kartta tıklanan ama hiçbir yere gitmeyen bir
    // buton üretir. Alan yoksa hiç yazılmamalı.
    const linkler: (string | undefined)[] =
      tip === "storefront"
        ? [app.distribution.links.itch, app.distribution.links.steam]
        : tip === "web_and_mobile"
          ? [app.distribution.webUrl, app.distribution.playStoreUrl, app.distribution.appStoreUrl]
          : tip === "web_redirect"
            ? [app.distribution.url]
            : [];

    for (const link of linkler) {
      if (link !== undefined && !/^https:\/\/\S+$/.test(link)) {
        hatalar.push(`${nerede}: geçersiz link → "${link}"`);
      }
    }

    if (app.publicRepo !== undefined && !/^https:\/\/\S+$/.test(app.publicRepo)) {
      hatalar.push(`${nerede}: geçersiz publicRepo → "${app.publicRepo}"`);
    }

    // Henüz duyurulmamış ürünün deposu private; detay sayfasına "kaynak kodu"
    // bağlantısı koymak kullanıcıyı 404'e yollamak olur.
    if (tip === "coming_soon" && app.publicRepo !== undefined) {
      hatalar.push(`${nerede}: coming_soon kaydında publicRepo olmamalı`);
    }

    // alt metni olmayan görsel, ekran okuyucu için hiç olmayan görselden kötü:
    // odağa giriyor ama bir şey söylemiyor.
    for (const [i, gorsel] of (app.screenshots ?? []).entries()) {
      if (!gorsel.src.trim()) hatalar.push(`${nerede}: screenshots[${i}].src boş`);
      if (!gorsel.alt.trim()) hatalar.push(`${nerede}: screenshots[${i}].alt boş`);
    }

    for (const [i, madde] of (app.highlights ?? []).entries()) {
      if (!madde.trim()) hatalar.push(`${nerede}: highlights[${i}] boş`);
    }
  }

  return hatalar;
}
