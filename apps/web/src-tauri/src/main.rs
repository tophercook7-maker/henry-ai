// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use std::path::PathBuf;

// Global static for the API server process
static API_SERVER: Mutex<Option<Child>> = Mutex::new(None);

fn get_api_server_path() -> PathBuf {
    let mut path = std::env::current_exe()
        .expect("Failed to get current executable path")
        .parent()
        .expect("Failed to get parent directory")
        .to_path_buf();
    
    #[cfg(debug_assertions)]
    {
        path = PathBuf::from("../../api");
    }
    
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
    
    Command::new("node")
        .arg(server_file)
        .current_dir(api_path)
        .spawn()
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
    // Start API server before building the app
    match start_api_server() {
        Ok(child) => {
            println!("✅ API server started successfully with PID: {}", child.id());
            *API_SERVER.lock().unwrap() = Some(child);
        }
        Err(e) => {
            eprintln!("❌ Failed to start API server: {}", e);
            eprintln!("The app will continue, but API features won't work.");
        }
    }
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_version, get_platform])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            // Clean up on exit
            match event {
                tauri::RunEvent::Exit => {
                    if let Ok(mut server) = API_SERVER.lock() {
                        if let Some(child) = server.as_mut() {
                            println!("Stopping API server...");
                            let _ = child.kill();
                        }
                    }
                }
                _ => {}
            }
        });
}

