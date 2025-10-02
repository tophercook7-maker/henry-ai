// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

struct ApiServer(Mutex<Option<Child>>);

fn start_api_server() -> Result<Child, std::io::Error> {
    #[cfg(target_os = "windows")]
    let child = Command::new("node")
        .arg("../../api/server.mjs")
        .current_dir(std::env::current_dir()?)
        .spawn()?;

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("node")
        .arg("../../api/server.mjs")
        .current_dir(std::env::current_dir()?)
        .spawn()?;

    Ok(child)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Start the API server when the app launches
            match start_api_server() {
                Ok(child) => {
                    println!("API server started successfully");
                    app.manage(ApiServer(Mutex::new(Some(child))));
                }
                Err(e) => {
                    eprintln!("Failed to start API server: {}", e);
                    // Continue anyway - user might have server running separately
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Kill the API server when the window closes
                if let Ok(mut api_server) = window.state::<ApiServer>().0.lock() {
                    if let Some(child) = api_server.as_mut() {
                        let _ = child.kill();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}