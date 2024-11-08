#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::Manager;

pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      let window = app.get_webview_window("main").unwrap();
      let _ = window.eval("window.location.replace('https://sigame.vladimirkhil.com')");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running SIGame");
}
