import { describe, expect, it } from "vitest";

import { enGuncelSurum, releaseSayfasi, tarihBicimle, type Release } from "./github";

function surum(tag: string, prerelease = false): Release {
  return {
    tag_name: tag,
    name: null,
    published_at: "2026-09-01T10:00:00Z",
    draft: false,
    prerelease,
    assets: [],
    html_url: `https://github.com/x/y/releases/tag/${tag}`,
  };
}

describe("enGuncelSurum", () => {
  it("varsayılan olarak ön sürümleri atlar", () => {
    const liste = [surum("v2.0.0", true), surum("v1.0.0")];
    expect(enGuncelSurum(liste)?.tag_name).toBe("v1.0.0");
  });

  it("allowPrerelease açıkken listenin başındakini alır", () => {
    const liste = [surum("v2.0.0", true), surum("v1.0.0")];
    expect(enGuncelSurum(liste, true)?.tag_name).toBe("v2.0.0");
  });

  /*
   * Muiget'in bugünkü durumu: v0.1.0'dan v0.1.5'e kadar hepsi prerelease.
   * `allowPrerelease` olmadan kullanıcı "sürüm yok" görürdü — bu testin
   * varlık sebebi bayrağın sessizce kaldırılmasını engellemek.
   */
  it("hepsi ön sürümse bayrak olmadan null döner", () => {
    const liste = [surum("v0.1.5", true), surum("v0.1.4", true)];
    expect(enGuncelSurum(liste)).toBeNull();
    expect(enGuncelSurum(liste, true)?.tag_name).toBe("v0.1.5");
  });

  // "Sürüm yok" bir hata değil: repo public ama paketi henüz yayınlanmamış.
  it("boş listede null döner", () => {
    expect(enGuncelSurum([])).toBeNull();
    expect(enGuncelSurum([], true)).toBeNull();
  });
});

describe("tarihBicimle", () => {
  it("ISO damgasını Türkçe tarihe çevirir", () => {
    expect(tarihBicimle("2026-09-01T10:00:00Z")).toBe("1 Eylül 2026");
  });

  it("geçersiz damgada boş dize döner", () => {
    expect(tarihBicimle("")).toBe("");
    expect(tarihBicimle("bir tarih değil")).toBe("");
  });
});

describe("releaseSayfasi", () => {
  it("depodan kaçış bağlantısı üretir", () => {
    expect(releaseSayfasi("heraklessii/Muiget")).toBe(
      "https://github.com/heraklessii/Muiget/releases",
    );
  });
});
