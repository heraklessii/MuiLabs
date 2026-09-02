//! Release asset indirme.
//!
//! Vitrin sürümünde bu iş tarayıcıya bırakılıyor; masaüstü sürümünde dosyayı
//! kullanıcının "İndirilenler" klasörüne biz yazıyoruz.
//!
//! Bu komut, arayüzden gelen bir URL'yi alıp diske dosya yazıyor — yani
//! kötüye kullanıldığında hem rastgele bir sunucuya istek atma hem de rastgele
//! bir yola yazma yolu. İkisi de burada kapatılıyor: adres yalnız GitHub'ın
//! release konaklarından olabilir, dosya adı yalnız düz bir ad olabilir.

use std::path::{Path, PathBuf};

use futures_util::StreamExt;
use tauri::Manager;
use tokio::io::AsyncWriteExt;

/// Asset adreslerinin gelebileceği konaklar.
///
/// `api.github.com` burada YOK: oradan sürüm bilgisi okunuyor, dosya değil.
/// GitHub asset indirmeleri `github.com` üzerinden başlayıp
/// `objects.githubusercontent.com`a yönleniyor.
const IZINLI_KONAKLAR: [&str; 3] = [
    "github.com",
    "objects.githubusercontent.com",
    "release-assets.githubusercontent.com",
];

fn konak_izinli(url: &str) -> bool {
    // Küçük bir ayrıştırma: şema + konak. Tam URL kitaplığı getirmek yerine
    // burada dar bir kontrol yeterli, çünkü kabul kümesi zaten çok dar.
    let Some(kalan) = url.strip_prefix("https://") else {
        return false;
    };
    let konak = kalan.split(['/', '?', '#']).next().unwrap_or("");
    // Kullanıcı adı/parola gömülü adresleri ("https://evil.com@github.com/")
    // reddet: konak alanında '@' olmamalı.
    if konak.contains('@') {
        return false;
    }
    IZINLI_KONAKLAR.contains(&konak)
}

/// Dosya adını tek bir dosya adına indirger.
///
/// Amaç `../../` ile klasör dışına çıkmayı ve mutlak yol vermeyi engellemek.
/// Ad tanınmaz hâle gelirse indirmeyi reddetmek, yanlış yere yazmaktan iyi.
fn guvenli_ad(ad: &str) -> Option<String> {
    let temiz = Path::new(ad).file_name()?.to_str()?.to_owned();

    if temiz.is_empty() || temiz == "." || temiz == ".." {
        return None;
    }
    // Windows'ta yol ayırıcı olarak ters bölü de geçerli; Path::file_name
    // Unix'te onu ayırıcı saymaz, o yüzden ayrıca eliyoruz.
    if temiz.contains('/') || temiz.contains('\\') || temiz.contains(':') {
        return None;
    }

    Some(temiz)
}

/// Aynı adda dosya varsa "ad (2).uzanti" gibi yeni bir ad üretir.
///
/// Üzerine yazmak, kullanıcının daha önce indirdiği bir dosyayı sessizce
/// yok etmek olurdu.
fn cakismayan_yol(klasor: &Path, ad: &str) -> PathBuf {
    let ilk = klasor.join(ad);
    if !ilk.exists() {
        return ilk;
    }

    let govde = Path::new(ad).file_stem().and_then(|s| s.to_str()).unwrap_or(ad);
    let uzanti = Path::new(ad).extension().and_then(|s| s.to_str());

    for n in 2..1000 {
        let yeni = match uzanti {
            Some(u) => format!("{govde} ({n}).{u}"),
            None => format!("{govde} ({n})"),
        };
        let yol = klasor.join(yeni);
        if !yol.exists() {
            return yol;
        }
    }

    ilk
}

/// Dosyayı indirip diske yazar, yazdığı tam yolu döndürür.
#[tauri::command]
pub async fn download_file(
    app: tauri::AppHandle,
    url: String,
    filename: String,
) -> Result<String, String> {
    if !konak_izinli(&url) {
        return Err("Bu adres indirilemez".into());
    }

    let ad = guvenli_ad(&filename).ok_or("Dosya adı geçersiz")?;

    let klasor = app
        .path()
        .download_dir()
        .map_err(|_| "İndirilenler klasörü bulunamadı".to_string())?;

    let yanit = reqwest::get(&url)
        .await
        .map_err(|e| format!("Bağlantı kurulamadı: {e}"))?;

    if !yanit.status().is_success() {
        return Err(format!("Sunucu {} döndü", yanit.status().as_u16()));
    }

    // Ad çakışması kontrolü indirme başlamadan hemen önce; dosyayı da o adla
    // açıyoruz ki yarım kalan indirme mevcut bir dosyayı bozmasın.
    let hedef = cakismayan_yol(&klasor, &ad);
    let mut dosya = tokio::fs::File::create(&hedef)
        .await
        .map_err(|e| format!("Dosya oluşturulamadı: {e}"))?;

    let mut akis = yanit.bytes_stream();
    while let Some(parca) = akis.next().await {
        let parca = parca.map_err(|e| format!("İndirme kesildi: {e}"))?;
        if let Err(e) = dosya.write_all(&parca).await {
            // Yarım dosyayı bırakmıyoruz: kullanıcı onu çalışır sanabilir.
            drop(dosya);
            let _ = tokio::fs::remove_file(&hedef).await;
            return Err(format!("Diske yazılamadı: {e}"));
        }
    }

    dosya
        .flush()
        .await
        .map_err(|e| format!("Diske yazılamadı: {e}"))?;

    Ok(hedef.to_string_lossy().into_owned())
}

#[cfg(test)]
mod testler {
    use super::*;

    #[test]
    fn yalniz_github_konaklari_kabul_edilir() {
        assert!(konak_izinli("https://github.com/a/b/releases/download/v1/x.msi"));
        assert!(konak_izinli("https://objects.githubusercontent.com/x"));

        assert!(!konak_izinli("http://github.com/a"), "http reddedilmeli");
        assert!(!konak_izinli("https://evil.com/x"));
        assert!(!konak_izinli("https://github.com.evil.com/x"));
        assert!(!konak_izinli("https://evil.com@github.com/x"));
        assert!(!konak_izinli("file:///C:/x"));
    }

    #[test]
    fn dosya_adi_klasor_disina_cikamaz() {
        assert_eq!(
            guvenli_ad("Muiget_0.1.5_x64_en-US.msi").as_deref(),
            Some("Muiget_0.1.5_x64_en-US.msi")
        );

        // Yol bileşenleri düşürülür, geriye yalnız dosya adı kalır — sonuç
        // her hâlükârda İndirilenler klasörünün içinde.
        assert_eq!(guvenli_ad("../../evil.exe").as_deref(), Some("evil.exe"));
        assert_eq!(guvenli_ad("/etc/passwd").as_deref(), Some("passwd"));

        // Geriye tutunacak bir ad kalmıyorsa indirme reddedilir.
        assert_eq!(guvenli_ad(".."), None);
        assert_eq!(guvenli_ad(""), None);
        assert_eq!(guvenli_ad("/"), None);
    }
}
