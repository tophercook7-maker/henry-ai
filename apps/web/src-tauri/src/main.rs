// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::{Arc, Mutex};
use tauri::Manager;
use std::path::PathBuf;

struct ApiServer(Arc<Mutex<Option<Child>>>);

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
    let api_server = Arc::new(Mutex::new(None));
    let api_server_clone = api_server.clone();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_app_version, get_platform])
        .setup(move |app| {
            // Start the API server when the app launches
            match start_api_server() {
                Ok(child) => {
                    println!("✅ API server started successfully");
                    *api_server.lock().unwrap() = Some(child);
                    app.manage(ApiServer(api_server.clone()));
                }
                Err(e) => {
                    eprintln!("❌ Failed to start API server: {}", e);
                    eprintln!("The app will continue, but API features won't work.");
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |_app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                // Kill the API server when the app exits
                if let Ok(mut server) = api_server_clone.lock() {
                    if let Some(child) = server.as_mut() {
                        println!("Stopping API server...");
                        let _ = child.kill();
                    }
                }
            }
        });
}