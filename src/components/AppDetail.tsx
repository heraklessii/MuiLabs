import type { GithubRelease, MuiApp } from "../config/apps.config";
import { useReleases } from "../hooks/useReleases";
import { disLinkAc, varlikYolu } from "../lib/actions";
import { boyutBicimle } from "../lib/asset-match";
import { tarihBicimle } from "../lib/github";
import { listeyeDon } from "../lib/route";
import { Aksiyon } from "./AppActions";
import { IconExternal, IconGeri } from "./Icons";
import { PrereleaseBadge, StatusBadge } from "./StatusBadge";

/**
 * Tek ürünün detay sayfası.
 *
 * Karttan farkı, kısaltmaması: açıklama üç satıra kırpılmıyor, ekran
 * görüntüleri tam boy, sürüm geçmişi son ona kadar açık. Aksiyon bloğu
 * kartınkiyle AYNI bileşen — iki ekranın farklı şey söylemesi imkânsız olsun.
 *
 * Bölümlerin hiçbiri boş çizilmiyor: `highlights` yoksa liste, `screenshots`
 * yoksa galeri, `github_release` değilse sürüm geçmişi hiç yok. "Ekran
 * görüntüsü eklenmedi" gibi bir yer tutucu, olmayan şeyi ekrana yazmak olur.
 */
export function AppDetail({ app }: { app: MuiApp }) {
  const surumKaynagi = surumDeposu(app);

  return (
    <article className="detay">
      <button type="button" className="geri" onClick={listeyeDon}>
        <IconGeri />
        Bütün uygulamalar
      </button>

      <header className="detay-bas">
        <img
          className="detay-ikon"
          src={varlikYolu(app.icon)}
          alt=""
          width={72}
          height={72}
        />
        <div className="detay-baslik">
          <div className="kart-ad">
            <h1>{app.name}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="detay-tagline">{app.tagline}</p>
        </div>
      </header>

      <div className="detay-govde">
        <div className="detay-ana">
          <p className="detay-aciklama">{app.description}</p>

          {app.highlights && app.highlights.length > 0 && (
            <section className="detay-bolum">
              <h2>Ne yapar</h2>
              <ul className="ozellikler">
                {app.highlights.map((madde) => (
                  <li key={madde}>{madde}</li>
                ))}
              </ul>
            </section>
          )}

          {app.screenshots && app.screenshots.length > 0 && (
            <section className="detay-bolum">
              <h2>Ekrandan</h2>
              <div className="galeri">
                {app.screenshots.map((g) => (
                  <img key={g.src} src={varlikYolu(g.src)} alt={g.alt} loading="lazy" />
                ))}
              </div>
            </section>
          )}

          {surumKaynagi && <SurumGecmisi dagitim={surumKaynagi} />}
        </div>

        <aside className="detay-yan">
          <div className="detay-aksiyon">
            <Aksiyon dagitim={app.distribution} ad={app.name} />
          </div>
          <Kunye app={app} />
        </aside>
      </div>
    </article>
  );
}

/**
 * Sürüm geçmişinin okunacağı depo.
 *
 * `storefront` ürünlerde geçmiş demonun deposundan gelir — Muifly'nin kendisi
 * mağazadan satılıyor ama demosu GitHub'dan iniyor, kullanıcının göreceği
 * sürümler onlar.
 */
function surumDeposu(app: MuiApp): GithubRelease | null {
  const d = app.distribution;
  if (d.type === "github_release") return d;
  if (d.type === "storefront" && d.demo) return d.demo;
  return null;
}

/**
 * Son sürümler.
 *
 * Sürüm notlarının METNİ burada gösterilmiyor: GitHub gövdeleri Markdown ve
 * onu doğru çizmek için bir ayrıştırıcı bağımlılığı gerekirdi; ham Markdown
 * basmak ise notu okunaksız hâle getirir. Her satır kendi GitHub sayfasına
 * gidiyor, notun tamamı orada.
 *
 * Ön sürümler burada AYIKLANMIYOR (kartta ayıklanıyor): geçmiş, olanı
 * gösterdiği için işe yarıyor.
 */
function SurumGecmisi({ dagitim }: { dagitim: GithubRelease }) {
  const { yukleniyor, tumu, hata } = useReleases(dagitim.repo, dagitim.allowPrerelease);

  if (yukleniyor) {
    return (
      <section className="detay-bolum">
        <h2>Sürüm geçmişi</h2>
        <div className="iskelet" />
      </section>
    );
  }

  // Hata ya da hiç sürüm yoksa bölüm hiç çizilmiyor: aksiyon bloğu zaten aynı
  // durumu söylüyor ve GitHub'a giden kaçış yolunu veriyor, ikinci kez
  // söylemek sayfayı hata mesajıyla dolduruyor.
  if (hata || tumu.length === 0) return null;

  return (
    <section className="detay-bolum">
      <h2>Sürüm geçmişi</h2>
      <ul className="surumler">
        {tumu.map((r) => (
          <li key={r.tag_name}>
            <button type="button" className="surum" onClick={() => void disLinkAc(r.html_url)}>
              <span className="surum-etiket">
                <code>{r.tag_name}</code>
                {r.prerelease && <PrereleaseBadge />}
              </span>
              <span className="surum-tarih">{tarihBicimle(r.published_at)}</span>
              <span className="surum-boyut">{paketOzeti(r.assets)}</span>
              <IconExternal />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "3 dosya · 48,2 MB" — sürümün ne kadar yer kapladığını göstermeye yeter. */
function paketOzeti(assets: { size: number }[]): string {
  if (assets.length === 0) return "paket yok";
  const toplam = assets.reduce((t, a) => t + a.size, 0);
  return `${assets.length} dosya · ${boyutBicimle(toplam)}`;
}

/** Lisans ve kaynak kodu — ikisi de yalnız gerçekten varsa. */
function Kunye({ app }: { app: MuiApp }) {
  if (!app.lisans && !app.publicRepo) return null;

  return (
    <dl className="kunye">
      {app.lisans && (
        <>
          <dt>Lisans</dt>
          <dd>{app.lisans}</dd>
        </>
      )}
      {app.publicRepo && (
        <>
          <dt>Kaynak kodu</dt>
          <dd>
            <button type="button" onClick={() => void disLinkAc(app.publicRepo!)}>
              {app.publicRepo.replace("https://github.com/", "")}
            </button>
          </dd>
        </>
      )}
    </dl>
  );
}
