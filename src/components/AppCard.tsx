import type { MuiApp } from "../config/apps.config";
import { varlikYolu } from "../lib/actions";
import { detayYolu } from "../lib/route";
import { Aksiyon } from "./AppActions";
import { StatusBadge } from "./StatusBadge";

/**
 * Vitrindeki tek ürün kartı.
 *
 * Kartın kendisi bir bağlantı DEĞİL, içinde aksiyon butonları var. Bunun
 * yerine ürün adı bir bağlantı ve `.kart-baglanti::after` bütün kartı kaplıyor
 * (CSS'te "stretched link"): boş yere tıklamak detaya götürüyor, butonlar ise
 * üstte kalıp kendi işlerini yapıyor. Kartı `<a>` içine almak ya da `onClick`
 * vermek, ekran okuyucuya tek bir dev bağlantı ya da hiç bağlantı gösterirdi.
 */
export function AppCard({ app }: { app: MuiApp }) {
  // Henüz duyurulmamış ürünün detay sayfasında gösterilecek bir şey yok;
  // kart pasif kalıyor, bağlantı hiç çizilmiyor.
  const detayVar = app.status !== "coming_soon";

  return (
    <li className={detayVar ? "kart" : "kart kart--pasif"}>
      <Onizleme app={app} />

      <div className="kart-bas">
        <img
          className="kart-ikon"
          src={varlikYolu(app.icon)}
          alt=""
          width={46}
          height={46}
          loading="lazy"
        />
        <div className="kart-baslik">
          <div className="kart-ad">
            <h2>
              {detayVar ? (
                <a className="kart-baglanti" href={detayYolu(app.id)}>
                  {app.name}
                </a>
              ) : (
                app.name
              )}
            </h2>
            <StatusBadge status={app.status} />
          </div>
          <p className="kart-tagline">{app.tagline}</p>
        </div>
      </div>

      <p className="kart-aciklama">{app.description}</p>

      <div className="kart-aksiyon">
        <Aksiyon dagitim={app.distribution} ad={app.name} />
      </div>
    </li>
  );
}

/**
 * Kartın üstündeki bant.
 *
 * Ekran görüntüsü varsa o; yoksa ürünün kendi ikonundan üretilen nötr bir
 * doku. İkinci hâl bilerek soyut: temsilî bir arayüz resmi koymak, kullanıcıya
 * göstermediğimiz bir şeyi göstermiş gibi yapmak olurdu. Bant her kartta aynı
 * yükseklikte çünkü ızgarada bir kartın bandı olup diğerininki olmayınca
 * satırın tamamı kayıyor.
 */
function Onizleme({ app }: { app: MuiApp }) {
  const gorsel = app.screenshots?.[0];

  if (!gorsel) {
    return (
      <div className="kart-gorsel kart-gorsel--bos" aria-hidden>
        <img src={varlikYolu(app.icon)} alt="" width={128} height={128} loading="lazy" />
      </div>
    );
  }

  return (
    <div className="kart-gorsel">
      <img src={varlikYolu(gorsel.src)} alt={gorsel.alt} loading="lazy" />
    </div>
  );
}
