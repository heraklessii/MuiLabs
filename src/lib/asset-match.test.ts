import { describe, expect, it } from "vitest";

import { apps, type GithubRelease, type MuiApp } from "../config/apps.config";
import { boyutBicimle, desteklenenPlatformlar, matchAssetForPlatform } from "./asset-match";
import type { ReleaseAsset } from "./github";

/*
 * Bu dosya vitrinin en riskli parçasını koruyor.
 *
 * Yanlış eşleşme sessizdir: buton çalışır, indirme başarılı olur, kullanıcı
 * çalıştırılamayan bir dosyayla kalır. Bu yüzden testler uydurma desenlerle
 * değil, `apps.config.ts`'teki GERÇEK desenlerle ve GitHub'daki gerçek asset
 * adlarıyla çalışıyor — desen bir gün gevşetilirse burası düşsün.
 */

function varlik(name: string, size = 1024): ReleaseAsset {
  return { name, browser_download_url: `https://github.com/x/y/releases/download/v1/${name}`, size };
}

function dagitimAl(id: string): GithubRelease {
  const app = apps.find((a: MuiApp) => a.id === id);
  if (!app) throw new Error(`config'te "${id}" yok`);

  const d = app.distribution;
  if (d.type === "github_release") return d;
  if (d.type === "storefront" && d.demo) return d.demo;
  throw new Error(`"${id}" github_release taşımıyor`);
}

describe("matchAssetForPlatform — gerçek config desenleri", () => {
  // v0.1.5 release'inin gerçek içeriği: yanında sha256 dosyaları da duruyor.
  const muigetVarliklari = [
    varlik("Muiget_0.1.5_x64_en-US.msi"),
    varlik("Muiget_0.1.5_x64_en-US.msi.sha256"),
    varlik("Muiget_0.1.5_x64-setup.exe"),
    varlik("Muiget_0.1.5_x64-setup.exe.sha256"),
    varlik("Muiget_0.1.5_universal.dmg"),
    varlik("Muiget_0.1.5_universal.app.tar.gz"),
    varlik("Muiget_0.1.5_amd64.AppImage"),
    varlik("Muiget_0.1.5_amd64.deb"),
    varlik("Muiget-0.1.5-1.x86_64.rpm"),
  ];

  const muiget = dagitimAl("muiget");

  it("Windows'ta .sha256 yan dosyasını değil kurulum paketini seçer", () => {
    const asset = matchAssetForPlatform(muigetVarliklari, muiget.platformAssets, "windows");
    expect(asset?.name).toBe("Muiget_0.1.5_x64_en-US.msi");
  });

  it("macOS'ta güncelleyiciye ait .app.tar.gz'yi değil .dmg'yi seçer", () => {
    const asset = matchAssetForPlatform(muigetVarliklari, muiget.platformAssets, "mac");
    expect(asset?.name).toBe("Muiget_0.1.5_universal.dmg");
  });

  it("Linux'ta desen sırasına uyar: AppImage önce", () => {
    const asset = matchAssetForPlatform(muigetVarliklari, muiget.platformAssets, "linux");
    expect(asset?.name).toBe("Muiget_0.1.5_amd64.AppImage");
  });

  it("Muivly'de kurulum paketi taşınabilir arşivden önce gelir", () => {
    const muivly = dagitimAl("muivly");
    const varliklar = [
      varlik("Muivly-0.2.0-portable.zip"),
      varlik("Muivly-0.2.0-setup.exe"),
      varlik("Muivly-0.2.0-setup.exe.sha256"),
    ];

    // Liste sırası değil DESEN sırası belirleyici: zip önce gelse bile
    // kullanıcı kurulum paketini almalı.
    expect(matchAssetForPlatform(varliklar, muivly.platformAssets, "windows")?.name).toBe(
      "Muivly-0.2.0-setup.exe",
    );
  });

  it("desteklenmeyen platform için null döner — bu hata değil", () => {
    const muivly = dagitimAl("muivly");
    const varliklar = [varlik("Muivly-0.2.0-setup.exe")];

    // Muivly Windows'a özel; mac/linux desenleri config'de hiç yok.
    expect(matchAssetForPlatform(varliklar, muivly.platformAssets, "mac")).toBeNull();
    expect(matchAssetForPlatform(varliklar, muivly.platformAssets, "linux")).toBeNull();
  });

  it("release'te yalnız yan dosyalar varsa hiçbir şey eşleşmez", () => {
    const yalnizSha = [varlik("Muiget_0.1.5_x64-setup.exe.sha256")];
    expect(matchAssetForPlatform(yalnizSha, muiget.platformAssets, "windows")).toBeNull();
  });

  it("desteklenenPlatformlar yalnız paketi olanları sayar", () => {
    expect(desteklenenPlatformlar(muigetVarliklari, muiget.platformAssets)).toEqual([
      "windows",
      "mac",
      "linux",
    ]);

    const sadeceWindows = [varlik("Muiget_0.1.5_x64_en-US.msi")];
    expect(desteklenenPlatformlar(sadeceWindows, muiget.platformAssets)).toEqual(["windows"]);
  });
});

describe("boyutBicimle", () => {
  it("MB'ı Türkçe ondalık ayırıcıyla yazar", () => {
    expect(boyutBicimle(5.6 * 1024 * 1024)).toBe("5,6 MB");
  });

  it("1 MB altını KB gösterir", () => {
    expect(boyutBicimle(512 * 1024)).toBe("512 KB");
  });

  // Boyut bilinmiyorsa satırda "0 B" gibi yanıltıcı bir şey durmasın.
  it("bilinmeyen ve geçersiz boyutta boş dize döner", () => {
    expect(boyutBicimle(0)).toBe("");
    expect(boyutBicimle(-1)).toBe("");
    expect(boyutBicimle(Number.NaN)).toBe("");
  });
});
