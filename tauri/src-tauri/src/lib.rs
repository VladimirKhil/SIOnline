#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_url_in_steam_overlay(client_state: tauri::State<Client>, url: String) {
    client_state
        .friends()
        .activate_game_overlay_to_web_page(&url);
}

use steamworks::Client;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

pub fn run() {
    // Initialize Tauri application with plugins
    // and set up the application state with Steam client
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize Steam (must have steam_appid.txt or app ID passed)
            let steam_result = Client::init_app(3553500);

            match steam_result {
                Ok((client, single)) => {
                    // Store the client in app state for later use
                    app.manage(client);

                    // Keep the client alive
                    std::thread::spawn(move || {
                        loop {
                            single.run_callbacks();
                            std::thread::sleep(std::time::Duration::from_millis(100));
                        }
                    });

                    log::info!("Steam client initialized successfully");
                },
                Err(e) => {
                    // Steam failed to initialize - show error to user
                    log::error!("Steam initialization failed: {}", e);

                    // Show error dialog to user
                    app.dialog()
                        .message("Steam must be running to play this game. Please start Steam and try again")
                        .title("Steam Error")
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();

                    std::process::exit(1);
                }
            }

            // Set up the main window
            Ok(())
          })
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![open_url_in_steam_overlay])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            log::error!("Error while running SIGame: {}", e);
            std::process::exit(1);
        });
}
