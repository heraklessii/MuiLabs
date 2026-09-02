import { useState } from "react";

import type { Distribution, GithubRelease, Platform } from "../config/apps.config";
import { useReleases } from "../hooks/useReleases";
import { usePlatform } from "../hooks/usePlatform";
import { boyutBicimle, desteklenenPlatformlar, matchAssetForPlatform } from "../lib/asset-match";
import { disLinkAc, indir } from "../lib/actions";
import { releaseSayfasi, type Release } from "../lib/github";
import { platformAdi } from "../lib/platform";
import { IconDownload, IconExternal, IconGlobe, IconLock, IconPhone, IconStore } from "./Icons";
import { PrereleaseBadge } from "./StatusBadge";

/**
 * Bir ürünün "ne yapabilirsin" bloğu — kartta da detay sayfasında da aynısı.
 *
 * Bileşenler ürünün ADINI bilmez: bütün davranış `distribution.type` üzerinden
 * dallanır. Yeni bir dağıtım şekli gerektiğinde union'a bir tip eklenir ve
 * buraya bir `case` gelir; mevcut ürünlere dokunulmaz.
 *
 * Kart ile detay sayfası aynı bloğu paylaştığı için ikisi asla farklı şey
 * söyleyemez. Kartta "indir" derken detayda "yakında" diyen bir vitrin,
 * hangisinin doğru olduğunu kullanıcıya sordurur.
 */
export function Aksiyon({ dagitim, ad }: { dagitim: Distribution; ad: string }) {
  switch (dagitim.type) {
    case "github_release":
      return <GithubAksiyon dagitim={dagitim} ad={ad} />;
    case "storefront":
      return <StorefrontAksiyon dagitim={dagitim} ad={ad} />;
    case "web_redirect":
      return <WebRedirectAksiyon url={dagitim.url} ad={ad} />;
    case "web_and_mobile":
      return <WebMobilAksiyon dagitim={dagitim} />;
    case "coming_soon":
      return <YakindaAksiyon />;
  }
}

/* -------------------------------------------------------------------------
 * github_release
 * ---------------------------------------------------------------------- */

function GithubAksiyon({
  dagitim,
  ad,
  etiket = "İndir",
}: {
  dagitim: GithubRelease;
  ad: string;
  /** Demo indirmelerinde "Demo" olur; kullanıcı ne aldığını bilmeli. */
  etiket?: string;
}) {
  const { yukleniyor, release, hata } = useReleases(dagitim.repo, dagitim.allowPrerelease);
  const platform = usePlatform();

  // Sürüm de platform da beklenirken nötr bir iskelet; yanıltıcı bir "hazır"
  // hâli göstermiyoruz.
  if (yukleniyor || platform === null) {
    return (
      <>
        <div className="iskelet" />
        <p className="bilgi">Sürüm kontrol ediliyor…</p>
      </>
    );
  }

  if (hata) {
    return (
      <>
        <KacisDugmesi repo={dagitim.repo} etiket="GitHub Releases" />
        <p className="bilgi bilgi--uyari">{hata}</p>
      </>
    );
  }

  // Repo public ama paketi yok. Bu "yakında" DEĞİL: ürün var, dağıtımı henüz
  // başlamadı. (Bugün Muifly demosu tam olarak bu durumda.)
  if (release === null) {
    return (
      <>
        <KacisDugmesi repo={dagitim.repo} etiket="Depoyu aç" />
        <p className="bilgi">Henüz sürüm yayınlanmadı</p>
      </>
    );
  }

  return (
    <IndirmeDugmeleri
      dagitim={dagitim}
      release={release}
      platform={platform}
      ad={ad}
      etiket={etiket}
    />
  );
}

function IndirmeDugmeleri({
  dagitim,
  release,
  platform,
  ad,
  etiket,
}: {
  dagitim: GithubRelease;
  release: Release;
  platform: Platform | "unknown";
  ad: string;
  etiket: string;
}) {
  const [iniyor, setIniyor] = useState<Platform | null>(null);
  const [indirmeHatasi, setIndirmeHatasi] = useState<string | null>(null);

  const varOlanlar = desteklenenPlatformlar(release.assets, dagitim.platformAssets);
  const onerilen = platform !== "unknown" && varOlanlar.includes(platform) ? platform : null;

  async function indirmeyiBaslat(hedef: Platform) {
    const asset = matchAssetForPlatform(release.assets, dagitim.platformAssets, hedef);
    if (!asset) return;

    setIniyor(hedef);
    setIndirmeHatasi(null);
    try {
      await indir(asset.browser_download_url, asset.name);
    } catch (err) {
      console.error(`[MuiLabs] ${ad} indirme hatası:`, err);
      setIndirmeHatasi("İndirme başarısız oldu");
    } finally {
      setIniyor(null);
    }
  }

  // Release var ama bu ürünün hiçbir platformu için desen tutmadı: sessizce
  // boş buton göstermek yerine kullanıcıyı release sayfasına yolluyoruz.
  if (varOlanlar.length === 0) {
    return (
      <>
        <KacisDugmesi repo={dagitim.repo} etiket="Sürüm sayfasını aç" />
        <p className="bilgi bilgi--uyari">Bu sürümde tanınan bir kurulum dosyası yok</p>
      </>
    );
  }

  // Platform algılanamadıysa (UA donduruldu, mobil tarayıcı vb.) hiçbirini
  // öne çıkarmıyoruz — yanlış dosya indirtmektense hepsini eşit gösteririz.
  const gosterilecekler = onerilen ? [onerilen] : varOlanlar;
  const digerleri = onerilen ? varOlanlar.filter((p) => p !== onerilen) : [];

  return (
    <>
      <div className="kart-butonlar">
        {gosterilecekler.map((p) => {
          const asset = matchAssetForPlatform(release.assets, dagitim.platformAssets, p)!;
          return (
            <button
              key={p}
              type="button"
              className={onerilen ? "dugme dugme--birincil dugme--genis" : "dugme"}
              disabled={iniyor !== null}
              onClick={() => void indirmeyiBaslat(p)}
              title={asset.name}
            >
              <IconDownload />
              {iniyor === p ? "İniyor…" : `${etiket} (${platformAdi(p)})`}
            </button>
          );
        })}
      </div>

      <p className={indirmeHatasi ? "bilgi bilgi--uyari" : "bilgi"}>
        {indirmeHatasi ?? (
          <>
            <code>{release.tag_name}</code>
            {onerilen && <span>{boyutBicimle(assetBoyutu(release, dagitim, onerilen))}</span>}
            {dagitim.allowPrerelease && release.prerelease && <PrereleaseBadge />}
          </>
        )}
      </p>

      {digerleri.length > 0 && (
        <div className="digerleri">
          {digerleri.map((p) => (
            <button
              key={p}
              type="button"
              disabled={iniyor !== null}
              onClick={() => void indirmeyiBaslat(p)}
            >
              {platformAdi(p)} sürümü
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function assetBoyutu(release: Release, dagitim: GithubRelease, p: Platform): number {
  return matchAssetForPlatform(release.assets, dagitim.platformAssets, p)?.size ?? 0;
}

/** Sürüm çekilemediğinde her zaman açık kalan kaçış yolu. */
function KacisDugmesi({ repo, etiket }: { repo: string; etiket: string }) {
  return (
    <button
      type="button"
      className="dugme dugme--genis"
      onClick={() => void disLinkAc(releaseSayfasi(repo))}
    >
      <IconExternal />
      {etiket}
    </button>
  );
}

/* -------------------------------------------------------------------------
 * storefront
 * ---------------------------------------------------------------------- */

function StorefrontAksiyon({
  dagitim,
  ad,
}: {
  dagitim: Extract<Distribution, { type: "storefront" }>;
  ad: string;
}) {
  const magazalar = [
    { anahtar: "steam", url: dagitim.links.steam, etiket: "Steam" },
    { anahtar: "itch", url: dagitim.links.itch, etiket: "itch.io" },
  ].filter((m): m is { anahtar: string; url: string; etiket: string } => Boolean(m.url));

  return (
    <>
      {magazalar.length > 0 ? (
        <div className="kart-butonlar">
          {magazalar.map((m) => (
            <button
              key={m.anahtar}
              type="button"
              className="dugme dugme--birincil"
              onClick={() => void disLinkAc(m.url)}
            >
              <IconStore />
              {m.etiket}
            </button>
          ))}
        </div>
      ) : (
        // Sayfa yoksa placeholder buton üretmiyoruz: tıklanan ama hiçbir yere
        // gitmeyen bir buton, olmayan bir sayfadan daha kötü.
        <p className="bilgi">Mağaza sayfası hazırlanıyor</p>
      )}

      {dagitim.demo && <GithubAksiyon dagitim={dagitim.demo} ad={ad} etiket="Demo" />}
    </>
  );
}

/* -------------------------------------------------------------------------
 * web_redirect / web_and_mobile
 * ---------------------------------------------------------------------- */

function WebRedirectAksiyon({ url, ad }: { url: string; ad: string }) {
  return (
    <button
      type="button"
      className="dugme dugme--birincil dugme--genis"
      onClick={() => void disLinkAc(url)}
    >
      <IconGlobe />
      {ad} sitesini aç
    </button>
  );
}

function WebMobilAksiyon({
  dagitim,
}: {
  dagitim: Extract<Distribution, { type: "web_and_mobile" }>;
}) {
  const mobil = [
    { anahtar: "play", url: dagitim.playStoreUrl, etiket: "Play Store" },
    { anahtar: "app", url: dagitim.appStoreUrl, etiket: "App Store" },
  ].filter((m): m is { anahtar: string; url: string; etiket: string } => Boolean(m.url));

  return (
    <>
      <div className="kart-butonlar">
        <button
          type="button"
          className="dugme dugme--birincil"
          onClick={() => void disLinkAc(dagitim.webUrl)}
        >
          <IconGlobe />
          Web'de aç
        </button>

        {/* Mağaza linki yoksa buton HİÇ çizilmiyor. "Yakında Play Store'da"
            gibi bir vaat de yazmıyoruz — tarihi bilmiyoruz. */}
        {mobil.map((m) => (
          <button
            key={m.anahtar}
            type="button"
            className="dugme"
            onClick={() => void disLinkAc(m.url)}
          >
            <IconPhone />
            {m.etiket}
          </button>
        ))}
      </div>
      <p className="bilgi">{alanAdi(dagitim.webUrl)}</p>
    </>
  );
}

function alanAdi(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/* -------------------------------------------------------------------------
 * coming_soon
 * ---------------------------------------------------------------------- */

function YakindaAksiyon() {
  // Depo bağlantısı YOK ve config'de böyle bir alan da yok: henüz duyurulmamış
  // ürünün deposu private, oraya link vermek kullanıcıyı 404'e yollamak olur.
  return (
    <p className="bilgi">
      <IconLock />
      Henüz duyurulmadı
    </p>
  );
}
