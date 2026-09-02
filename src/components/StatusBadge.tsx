import type { AppStatus } from "../config/apps.config";

/**
 * Kartın sağ üstündeki durum rozeti.
 *
 * Renkler jetondan: live teal, demo sarı, yakında gri. Etiketler Türkçe ve
 * sabit — "Yayında" ile "Demo" arasındaki fark kullanıcının satın alma/indirme
 * beklentisini belirliyor, esnetilmemeli.
 */

const ETIKET: Record<AppStatus, string> = {
  live: "Yayında",
  demo: "Demo",
  coming_soon: "Yakında",
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`rozet rozet--${status}`}>
      <span className="rozet-nokta" aria-hidden />
      {ETIKET[status]}
    </span>
  );
}

/**
 * Sürüm etiketinin yanındaki "ön sürüm" işareti.
 *
 * Muiget'in bütün sürümleri prerelease; kararlı sanılarak indirilmesin diye
 * bu rozet gizlenmiyor. `allowPrerelease` açık olan her üründe görünür.
 */
export function PrereleaseBadge() {
  return (
    <span className="rozet rozet--onsurum" title="Kararlı olarak işaretlenmemiş bir sürüm">
      ön sürüm
    </span>
  );
}
