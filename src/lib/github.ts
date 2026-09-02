/**
 * GitHub Releases istemcisi — client-side, canlı, cache'siz.
 *
 * Kullanıcı MuiLabs'ı her açtığında sürümler GitHub'dan çekilir. Kalıcı cache
 * (localStorage/disk) KASITLI olarak yok: kullanıcı "en son sürüm"
 * beklentisiyle geliyor, bayat veri göstermek bu vitrinin tek işini bozar.
 * Bkz. docs/github-integration.md.
 */

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface Release {
  tag_name: string;
  /** Sürüme verilen başlık; GitHub'da boş bırakılabildiği için null olabilir. */
  name: string | null;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: ReleaseAsset[];
  /** Release sayfası — asset eşleşmediğinde ya da hata olduğunda kaçış yolu. */
  html_url: string;
}

/** Çağıranın kullanıcıya ne göstereceğine karar verebilmesi için tipli hata. */
export class GithubHatasi extends Error {
  constructor(
    message: string,
    readonly durum: number,
    /** Rate limit (403/429) ise: "şu an kontrol edilemiyor", ağ hatasından farklı mesaj. */
    readonly rateLimit: boolean,
  ) {
    super(message);
    this.name = "GithubHatasi";
  }
}

const REPO_SAYFASI = "https://github.com";

/** Release'ler boş dönerse kartın yönlendireceği yer. */
export function releaseSayfasi(repo: string): string {
  return `${REPO_SAYFASI}/${repo}/releases`;
}

/**
 * Bir deponun yayınlanmış sürümleri, yeniden eskiye.
 *
 * `GET /releases/latest` KULLANILMIYOR — o uç prerelease ve draft kayıtları
 * atlar ve hiç kararlı sürüm yoksa 404 döner. Muiget'in bugün v0.1.5 dâhil
 * bütün release'leri prerelease olduğu için o yolla "sürüm yok" görünürdü.
 *
 * Draft kayıtlar burada elenir: yayınlanmamış bir sürüm kullanıcının hiçbir
 * ekranında görünmemeli. Prerelease ayıklaması ise çağırana bırakılıyor —
 * kart yalnız indirilebilir olanı seçerken, detay sayfası geçmişin tamamını
 * gösteriyor.
 *
 * Depo yoksa, private'sa ya da silinmişse boş liste döner (hata değil):
 * config'e girerken public olduğu doğrulanmış olmalı, yine de çökmüyoruz.
 *
 * Aynı anda aynı depoyu soran çağrılar TEK isteğe indirgenir (detay sayfasında
 * indirme bloğu ile sürüm geçmişi tam olarak bunu yapıyor). Bu bir cache
 * değil: kayıt istek biter bitmez siliniyor, sonuç saklanmıyor. Sayfa
 * yenilenince ya da kullanıcı listeye dönüp tekrar girince veri baştan
 * çekilir — bkz. CLAUDE.md karar 3, kalıcı cache yok.
 */
const ucusanlar = new Map<string, Promise<Release[]>>();

export function fetchReleases(repo: string): Promise<Release[]> {
  const mevcut = ucusanlar.get(repo);
  if (mevcut) return mevcut;

  const istek = releaseleriCek(repo).finally(() => {
    ucusanlar.delete(repo);
  });
  ucusanlar.set(repo, istek);
  return istek;
}

/*
 * İstek bilerek İPTAL EDİLEBİLİR DEĞİL: aynı promise'i birden çok bileşen
 * bekliyor, birinin sökülmesi diğerinin verisini yok edemez. Bileşen sökülünce
 * çağıran taraf sonucu yok sayıyor (useReleases'teki `iptal` bayrağı) — istek
 * zaten yola çıkmış olduğu için kotadan da bir şey kazanılmazdı.
 */
async function releaseleriCek(repo: string): Promise<Release[]> {
  let res: Response;

  try {
    // per_page=10: kartın aradığı kayıt her zaman listenin başında, detay
    // sayfasının gösterdiği geçmiş de zaten bu kadarla sınırlı.
    res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=10`, {
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch {
    throw new GithubHatasi("Ağ hatası", 0, false);
  }

  if (res.status === 404) return [];

  if (!res.ok) {
    // GitHub kotayı 403 ile de 429 ile de bildirebiliyor; ayırt edici asıl
    // işaret kalan hakkın sıfır olması.
    const kalan = res.headers.get("X-RateLimit-Remaining");
    const rateLimit = (res.status === 403 || res.status === 429) && kalan === "0";
    throw new GithubHatasi(`GitHub API ${res.status}`, res.status, rateLimit);
  }

  // Geliştirme sırasında işe yarayan tek sinyal; kullanıcıya gösterilmiyor.
  const kalan = Number(res.headers.get("X-RateLimit-Remaining") ?? NaN);
  if (import.meta.env.DEV && kalan <= 5) {
    console.warn(`[MuiLabs] GitHub API kotası azalıyor: ${kalan} istek kaldı`);
  }

  const releases = (await res.json()) as Release[];
  return releases.filter((r) => !r.draft);
}

/**
 * Listeden kullanıcıya verilecek sürüm.
 *
 * `allowPrerelease` kapalıyken ön sürümler atlanır; uygun kayıt yoksa null —
 * bu "hata" değil, "repo public ama indirilebilir paketi yok" demek (bugün
 * Muifly demosu tam olarak bu durumda).
 */
export function enGuncelSurum(releases: Release[], allowPrerelease = false): Release | null {
  return releases.find((r) => allowPrerelease || !r.prerelease) ?? null;
}

/** "3 Eylül 2026" — sürüm geçmişinde ham ISO damgası gösterilmez. */
export function tarihBicimle(iso: string): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
