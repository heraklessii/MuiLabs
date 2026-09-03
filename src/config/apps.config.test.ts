import { describe, expect, it } from "vitest";

import { apps, validateApps, type MuiApp } from "./apps.config";

/*
 * `validateApps` üretimde ÇALIŞMIYOR (bozuk bir kayıt yüzünden kullanıcının
 * vitrini bomboş açılmasın diye) ve geliştirmede yalnız konsola yazıyor —
 * yani kimse konsola bakmazsa bozuk bir kayıt sessizce yayına gidebilir.
 *
 * Bu test o boşluğu kapatıyor: denetim artık CI'da zorunlu.
 */

describe("gerçek config", () => {
  it("tutarlılık denetiminden geçer", () => {
    expect(validateApps(apps)).toEqual([]);
  });

  it("boş değilse ve id'ler benzersizse", () => {
    expect(apps.length).toBeGreaterThan(0);
    expect(new Set(apps.map((a) => a.id)).size).toBe(apps.length);
  });

  /*
   * Vitrinin bütün sözü bu: kullanıcı ne indireceğini görüyor. Bir kayıtta
   * ad ya da açıklama boş kalırsa kart yarım çizilir.
   */
  it("her kayıtta ad, tagline, açıklama ve ikon dolu", () => {
    for (const app of apps) {
      expect(app.name.trim(), app.id).not.toBe("");
      expect(app.tagline.trim(), app.id).not.toBe("");
      expect(app.description.trim(), app.id).not.toBe("");
      expect(app.icon, app.id).toMatch(/^icons\/.+\.svg$/);
    }
  });

  it("ekran görüntüsü yolları public/screenshots altına işaret eder", () => {
    for (const app of apps) {
      for (const g of app.screenshots ?? []) {
        expect(g.src, app.id).toMatch(/^screenshots\/.+\.(png|jpg|webp)$/);
      }
    }
  });

  /*
   * Duyurulmamış bir ürünün depo adı bundle'a girmemeli. Alan tipten
   * kaldırıldı ama kayıtlarda elle bir yere yazılmadığını da doğruluyoruz.
   */
  it("coming_soon kayıtlarında depo bağlantısı taşınmaz", () => {
    for (const app of apps.filter((a) => a.status === "coming_soon")) {
      expect(app.publicRepo, app.id).toBeUndefined();
      expect(JSON.stringify(app), app.id).not.toMatch(/github\.com/);
    }
  });
});

describe("validateApps bozuk kayıtları yakalar", () => {
  const saglam = apps[0];

  function bozuk(degisiklik: Partial<MuiApp>): MuiApp {
    return { ...saglam, ...degisiklik };
  }

  it("kebab-case olmayan id", () => {
    expect(validateApps([bozuk({ id: "Muiget" })]).join(" ")).toMatch(/kebab-case/);
  });

  it("tekrar eden id", () => {
    expect(validateApps([saglam, saglam]).join(" ")).toMatch(/tekrar/);
  });

  it("status ile dağıtım tipi uyuşmuyor", () => {
    const hatalar = validateApps([
      bozuk({ status: "coming_soon", distribution: { type: "github_release", repo: "a/b", platformAssets: {} } }),
    ]);
    expect(hatalar.join(" ")).toMatch(/coming_soon/);
  });

  it("repo formatı bozuk", () => {
    const hatalar = validateApps([
      bozuk({ distribution: { type: "github_release", repo: "sadecead", platformAssets: {} } }),
    ]);
    expect(hatalar.join(" ")).toMatch(/sahip\/ad/);
  });

  // Boş string bir link değil: tıklanan ama hiçbir yere gitmeyen buton üretir.
  it("boş string link", () => {
    const hatalar = validateApps([
      bozuk({ status: "live", distribution: { type: "web_redirect", url: "" } }),
    ]);
    expect(hatalar.join(" ")).toMatch(/geçersiz link/);
  });

  it("alt metni olmayan ekran görüntüsü", () => {
    const hatalar = validateApps([bozuk({ screenshots: [{ src: "screenshots/x.png", alt: "  " }] })]);
    expect(hatalar.join(" ")).toMatch(/alt boş/);
  });

  it("coming_soon kaydında publicRepo", () => {
    const hatalar = validateApps([
      bozuk({
        status: "coming_soon",
        distribution: { type: "coming_soon" },
        publicRepo: "https://github.com/a/b",
      }),
    ]);
    expect(hatalar.join(" ")).toMatch(/publicRepo olmamalı/);
  });
});
