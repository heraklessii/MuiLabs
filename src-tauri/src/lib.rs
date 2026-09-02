//! MuiLabs masaüstü kabuğu.
//!
//! Rust katmanı kasten ince: vitrinin bütün mantığı React tarafında, burada
//! yalnız tarayıcının yapamadığı iki iş var — kesin platform bilgisi ve
//! dosyayı kullanıcının diskine yazmak. Üçüncüsü, dış bağlantıyı uygulamanın
//! içinde değil kullanıcının kendi tarayıcısında açmak.

mod download;
mod platform;

use tauri_plugin_opener::OpenerExt;

/// Dış bağlantıyı kullanıcının varsayılan tarayıcısında açar.
///
/// `window.open` burada yeni bir WebView penceresi açardı; mağaza ya da site
/// sayfasını uygulamanın içinde göstermek istemiyoruz.
///
/// Şema kontrolü şart: bu komut arayüzden gelen bir dizeyi işletim sistemine
/// "aç" diye veriyor. `https` dışındaki şemalar (`file:`, `ms-settings:`,
/// kayıtlı başka uygulama şemaları) burada bir program çalıştırma yolu olurdu.
#[tauri::command]
async fn open_external(app: tauri::AppHandle, url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("Yalnız https adresleri açılabilir".into());
    }

    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            platform::get_platform,
            download::download_file,
            open_external
        ])
        .run(tauri::generate_context!())
        .expect("MuiLabs baslatilamadi");
}
