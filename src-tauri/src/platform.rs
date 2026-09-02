//! İşletim sistemi bilgisi.
//!
//! Web tarafı bunu UA dizesinden tahmin etmek zorunda; burada derleme
//! zamanından gelen kesin bilgi var. Ayrım `src/lib/platform.ts` içinde.

/// `"windows" | "macos" | "linux"` (ya da derlendiği başka bir hedef).
///
/// Frontend "macos" yerine "mac" kullanıyor; çeviriyi orada yapıyoruz ki
/// Rust tarafı Rust'ın kendi adlandırmasına sadık kalsın.
#[tauri::command]
pub fn get_platform() -> &'static str {
    std::env::consts::OS
}
