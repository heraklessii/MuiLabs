# GitHub Releases Entegrasyonu

## Prensip

**Client-side, canlı, cache'siz.** Kullanıcı MuiLabs'ı her açtığında,
`github_release` tipli her ürün için GitHub API'den sürüm bilgisi çekilir.
Sonuç sayfa oturumu boyunca component state'inde tutulur (re-render'da tekrar
fetch etme) ama sayfa yenilenince veya app yeniden açılınca tekrar çekilir.
Kalıcı cache (localStorage/disk) kasıtlı olarak YOK.

## `releases/latest` tuzağı — ÖNEMLİ

GitHub'ın `GET /repos/{repo}/releases/latest` ucu **prerelease ve draft
kayıtlarını atlar**. Hiç kararlı release yoksa `404` döner.

Bu teorik bir kenar durum değil, bugünkü gerçek durum:
`heraklessii/Muiget`'in v0.1.5'e kadar **bütün release'leri prerelease**.
Sade `latest` çağrısı Muiget'i "henüz release yok" diye gösterir — yanlış.

Bu yüzden tek yol `GET /repos/{repo}/releases` (liste) üzerinden gitmek:
Gerçek uygulama [`src/lib/github.ts`](../src/lib/github.ts) içinde; buraya
kopyası çıkarılmıyor (kopya er geç koddan ayrışır). Dışa açtığı yüzey:

```typescript
fetchReleases(repo): Promise<Release[]>      // draft'lar elenmiş, yeniden eskiye
enGuncelSurum(releases, allowPrerelease)     // indirilebilir olan; yoksa null
releaseSayfasi(repo): string                 // hata hâlindeki kaçış yolu
tarihBicimle(iso): string                    // "3 Eylül 2026"
class GithubHatasi extends Error             // .durum, .rateLimit
```

Ayrım kasıtlı: **draft** ayıklaması kütüphanede (yayınlanmamış sürüm hiçbir
ekranda görünmemeli), **prerelease** ayıklaması çağıranda. Kart yalnız
indirilebilir olanı seçiyor, detay sayfasındaki sürüm geçmişi hepsini
gösteriyor — geçmiş, olanı gösterdiği için işe yarıyor.

`per_page=10` yeterli: kartın aradığı kayıt her zaman listenin başında, detay
sayfasının gösterdiği geçmiş de zaten bu kadarla sınırlı.

404 → boş liste, hata değil. Repo yok, private ya da silinmiş demek; config'e
girerken public olduğu doğrulanmış olmalı, yine de çökmüyoruz.

## Eşzamanlı İstek Birleştirme

`fetchReleases` aynı depo için **uçuşta olan** isteği paylaşıyor
(`ucusanlar` haritası). Sebebi somut: detay sayfasında indirme bloğu ile sürüm
geçmişi aynı anda mount oluyor ve ikisi de aynı depoyu soruyor — birleştirme
olmasa saatlik 60'lık kota sebepsiz ikiye katlanırdı.

Bu bir cache **değil**: kayıt istek biter bitmez siliniyor, sonuç saklanmıyor.
Sayfa yenilenince ya da kullanıcı listeye dönüp tekrar girince veri baştan
çekiliyor.

İstek bilerek iptal edilebilir değil: aynı promise'i birden çok bileşen
bekliyor, birinin sökülmesi diğerinin verisini yok edemez. Bileşen sökülünce
çağıran taraf sonucu yok sayıyor (`useReleases`'teki `iptal` bayrağı) — istek
zaten yola çıktığı için kotadan bir şey de kazanılmazdı.

## Neden Cache Yok

- Unauthenticated GitHub API rate limit: 60 istek/saat/IP. MuiLabs'ta şu an
  `github_release` çağrısı gerektiren 3 kayıt var (Muiget, Muivly, Muifly'nin
  demo repo'su) = açılış başına 3 istek. Bu ölçekte cache karmaşıklığı gereksiz.
- Kullanıcı "en son sürüm" beklentisiyle geliyor; cache stale-data riski taşır.
- İleride ürün sayısı artarsa (10+) authenticated rate limit'e (5000/saat) veya
  hafif bir edge cache'e geçilebilir — ama bugün için over-engineering.

## Hook

[`src/hooks/useReleases.ts`](../src/hooks/useReleases.ts) →
`{ yukleniyor, release, tumu, hata }`.

`release` (indirilebilir sürüm) ve `tumu` (geçmiş) aynı listeden türetiliyor.
`hata` kullanıcıya gösterilecek kısa metin — sebebi değil, ne yapabileceğini
söyler; teknik ayrıntı `console.error`'da kalır. Rate limit ayrı bir metin
alıyor ("Şu an kontrol edilemiyor"), çünkü kullanıcının yapacağı şey farklı:
beklemek, yeniden denemek değil.

`release === null` bir hata **değil** — "repo public ama indirilebilir paketi
yok" demek (bugün Muifly demosu tam olarak bu durumda). UI ikisini ayrı
gösteriyor, bkz. `docs/ui-conventions.md`.

## Platform Asset Eşleştirme

Desenler **öncelik sıralı** bir liste olabilir (bkz. `docs/apps-registry.md`):
Muivly release'inde hem `-setup.exe` hem `-portable.zip` var, kurulum paketi
önce gelmeli.

```typescript
// src/lib/asset-match.ts
export function matchAssetForPlatform(
  assets: ReleaseAsset[],
  matchers: PlatformAssetMatcher,
  platform: "windows" | "mac" | "linux",
): ReleaseAsset | null {
  const raw = matchers[platform];
  if (!raw) return null;                       // o platform desteklenmiyor
  const patterns = Array.isArray(raw) ? raw : [raw];

  // Desen sırası öncelik: ilk deseni eşleyen asset kazanır.
  for (const pattern of patterns) {
    const hit = assets.find((a) => pattern.test(a.name));
    if (hit) return hit;
  }
  return null;
}
```

**Yan dosya tuzağı:** release'lerde asset olarak `.sha256` (Muivly) ve
`.app.tar.gz` (Muiget güncelleyicisi) gibi kullanıcıya verilmemesi gereken
dosyalar da var. Desenler bu yüzden `$` ile biter — `/\.exe/` yerine
`/-setup\.exe$/`, aksi halde `Muivly-0.2.0-setup.exe.sha256` eşleşir.

## Hata / Kenar Durumları

| Durum | Davranış |
|---|---|
| Uygun release yok (`null`) | "Henüz sürüm yayınlanmadı" + repo'ya link. **"Yakında" gibi gösterme** — ürün var, paketi yok (bugün Muifly demosu bu durumda) |
| 404 (repo private/yok) | Aynı fallback; config'e girerken repo'nun public olduğu doğrulanmalı |
| Rate limit (403) | "Şu an kontrol edilemiyor, GitHub Releases'e git" fallback linki; sessizce hata basma |
| Asset eşleşmedi (ör. Muivly'de Linux yok) | O platform butonu hiç gösterilmez; diğer platformlar etkilenmez |
| Yalnız prerelease var, `allowPrerelease: false` | `null` döner — Muiget'te bu bir **config hatası**, `allowPrerelease: true` olmalı |

## Prerelease'in Kullanıcıya Gösterimi

`allowPrerelease: true` ile gelen bir sürüm kullanıcıya **öyle olduğu
söylenerek** verilir: sürüm etiketinin yanında küçük bir "ön sürüm" rozeti.
Kararlı sanılan bir 0.1.5'i sessizce indirtmek dürüst değil.

## Rate Limit İzleme (opsiyonel, ileri faz)

Response header'larında `X-RateLimit-Remaining` gelir; düşükse (<5) konsola
uyarı loglanabilir. Kullanıcıya gösterilecek bir UI elemanı DEĞİL, sadece
geliştirme sırasında debug için.
