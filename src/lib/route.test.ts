import { describe, expect, it } from "vitest";

import { detayYolu, rotayiCoz } from "./route";

const IDLER = ["muiget", "muivly", "muita"];

describe("rotayiCoz", () => {
  it("hash yoksa ya da tanınmıyorsa liste", () => {
    expect(rotayiCoz("", IDLER)).toEqual({ tur: "liste" });
    expect(rotayiCoz("#", IDLER)).toEqual({ tur: "liste" });
    expect(rotayiCoz("#/baska/yer", IDLER)).toEqual({ tur: "liste" });
  });

  it("tanınan id detay rotası verir", () => {
    expect(rotayiCoz("#/uygulama/muiget", IDLER)).toEqual({ tur: "detay", id: "muiget" });
  });

  // Eski/yanlış bir bağlantıyla gelen kullanıcı boş bir detay sayfası değil
  // vitrini görmeli.
  it("tanınmayan id listeye düşer", () => {
    expect(rotayiCoz("#/uygulama/olmayan", IDLER)).toEqual({ tur: "liste" });
  });

  it("id verilmemişse listeye düşer", () => {
    expect(rotayiCoz("#/uygulama/", IDLER)).toEqual({ tur: "liste" });
  });

  it("yüzde kaçışını çözer", () => {
    expect(rotayiCoz(detayYolu("muiget"), IDLER)).toEqual({ tur: "detay", id: "muiget" });
  });

  // decodeURIComponent bozuk kaçışta atar; adres çubuğuna elle yazılan bir
  // şey uygulamayı düşürmemeli.
  it("bozuk yüzde kaçışında çökmez", () => {
    expect(rotayiCoz("#/uygulama/%", IDLER)).toEqual({ tur: "liste" });
    expect(rotayiCoz("#/uygulama/%E0%A4%A", IDLER)).toEqual({ tur: "liste" });
  });

  it("id listesi verilmezse doğrulama yapmaz", () => {
    expect(rotayiCoz("#/uygulama/herhangi")).toEqual({ tur: "detay", id: "herhangi" });
  });
});

describe("detayYolu", () => {
  it("rotayiCoz ile karşılıklı çalışır", () => {
    for (const id of IDLER) {
      expect(rotayiCoz(detayYolu(id), IDLER)).toEqual({ tur: "detay", id });
    }
  });
});
