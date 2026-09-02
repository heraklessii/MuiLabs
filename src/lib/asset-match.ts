/**
 * Release asset'lerini platforma eşleme.
 *
 * Amaç: kullanıcıya "hangi dosyayı indireyim" diye sormamak. Yanlış eşleşme
 * bu amacı tersine çevirir — indirme butonu çalışır ama işe yaramaz bir dosya
 * verir. Bu yüzden desenler dar tutuluyor (bkz. apps.config.ts).
 */

import type { Platform, PlatformAssetMatcher } from "../config/apps.config";
import type { ReleaseAsset } from "./github";

/**
 * Verilen platform için ilk eşleşen asset. Desen listesindeki SIRA önceliktir:
 * Muivly'de `-setup.exe` kurulum paketi, `-portable.zip`ten önce gelir.
 *
 * O platform için desen tanımlı değilse null döner — bu bir hata değil, ürünün
 * o platformu desteklemediği anlamına gelir (Muivly'nin Linux'u gibi).
 */
export function matchAssetForPlatform(
  assets: ReleaseAsset[],
  matchers: PlatformAssetMatcher,
  platform: Platform,
): ReleaseAsset | null {
  const ham = matchers[platform];
  if (!ham) return null;

  const desenler = Array.isArray(ham) ? ham : [ham];

  for (const desen of desenler) {
    // `RegExp.test` lastIndex taşıdığı için global bayraklı desenler burada
    // sonuçları kaydırır; config'de /g kullanılmıyor ama bir gün eklenirse
    // sessizce bozulmasın diye sıfırlıyoruz.
    desen.lastIndex = 0;
    const bulunan = assets.find((a) => desen.test(a.name));
    if (bulunan) return bulunan;
  }

  return null;
}

/** Bir release'te hangi platformların paketi var — "diğer platformlar" satırı için. */
export function desteklenenPlatformlar(
  assets: ReleaseAsset[],
  matchers: PlatformAssetMatcher,
): Platform[] {
  const hepsi: Platform[] = ["windows", "mac", "linux"];
  return hepsi.filter((p) => matchAssetForPlatform(assets, matchers, p) !== null);
}

/** "42,3 MB" — indirmeden önce kullanıcı ne kadar veri indireceğini görmeli. */
export function boyutBicimle(bayt: number): string {
  if (!Number.isFinite(bayt) || bayt <= 0) return "";
  const mb = bayt / (1024 * 1024);
  if (mb < 1) return `${Math.round(bayt / 1024)} KB`;
  return `${mb.toFixed(1).replace(".", ",")} MB`;
}
