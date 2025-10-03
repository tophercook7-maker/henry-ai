// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;
use std::path::PathBuf;

struct ApiServer(Mutex<Option<Child>>);

fn get_api_server_path() -> PathBuf {
    // Get the resource directory where we'll bundle the API server
    let mut path = std::env::current_exe()
        .expect("Failed to get current executable path")
        .parent()
        .expect("Failed to get parent directory")
        .to_path_buf();
    
    // In development, use the local path
    #[cfg(debug_assertions)]
    {
        path = PathBuf::from("../../api");
    }
    
    // In production, the API server will be bundled
    #[cfg(not(debug_assertions))]
    {
        path.push("api");
    }
    
    path
}

fn start_api_server() -> Result<Child, std::io::Error> {
    let api_path = get_api_server_path();
    let server_file = api_path.join("server-ultimate.mjs");
    
    println!("Starting API server from: {:?}", server_file);
    
    let child = Command::new("node")
        .arg(server_file)
        .current_dir(api_path)
        .spawn()?;
    
    println!("API server started with PID: {}", child.id());
    Ok(child)
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_app_version, get_platform])
        .setup(|app| {
            // Start the API server when the app launches
            match start_api_server() {
                Ok(child) => {
                    println!("✅ API server started successfully");
                    app.manage(ApiServer(Mutex::new(Some(child))));
                }
                Err(e) => {
                    eprintln!("❌ Failed to start API server: {}", e);
                    eprintln!("The app will continue, but API features won't work.");
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Kill the API server when the window closes
                if let Ok(mut api_server) = window.state::<ApiServer>().0.lock() {
                    if let Some(child) = api_server.as_mut() {
                        println!("Stopping API server...");
                        let _ = child.kill();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}