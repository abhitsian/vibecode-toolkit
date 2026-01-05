use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    menu::{Menu, MenuItem},
    image::Image,
    Manager, WebviewWindow, AppHandle, Runtime, Emitter,
};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use std::process::Command;

#[derive(serde::Serialize)]
struct CaptureStats {
    total: u32,
    today: u32,
    resolved: u32,
}

// Tauri commands that can be called from the frontend
#[tauri::command]
async fn get_capture_stats() -> Result<CaptureStats, String> {
    // TODO: Implement actual stats from .vibe directory
    Ok(CaptureStats {
        total: 0,
        today: 0,
        resolved: 0,
    })
}

#[tauri::command]
async fn quick_capture(app: AppHandle, description: String) -> Result<(), String> {
    // Call the CLI command
    let output = Command::new("bun")
        .args(&["run", "src/cli.ts", "capture", &description])
        .output()
        .map_err(|e| format!("Failed to run capture: {}", e))?;

    if output.status.success() {
        // Emit event to frontend to update UI
        app.emit("capture-complete", description)
            .map_err(|e| format!("Failed to emit event: {}", e))?;
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn take_screenshot(app: AppHandle) -> Result<(), String> {
    let output = Command::new("bun")
        .args(&["run", "src/cli.ts", "snapshot", "before"])
        .output()
        .map_err(|e| format!("Failed to take screenshot: {}", e))?;

    if output.status.success() {
        app.emit("screenshot-complete", ())
            .map_err(|e| format!("Failed to emit event: {}", e))?;
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn start_recording(app: AppHandle) -> Result<(), String> {
    // TODO: Implement actual video recording
    app.emit("recording-started", ())
        .map_err(|e| format!("Failed to emit event: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn hide_window(window: WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

fn position_window_near_tray<R: Runtime>(window: &WebviewWindow<R>) -> Result<(), tauri::Error> {
    // Get screen size
    if let Some(monitor) = window.current_monitor()? {
        let screen = monitor.size();
        let window_size = window.outer_size()?;

        // Position in top-right corner (macOS menu bar style)
        let x = screen.width as i32 - window_size.width as i32 - 20;
        let y = 40; // Below menu bar

        window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))?;
    }

    Ok(())
}

fn toggle_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = position_window_near_tray(&window);
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Set up logging
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Create system tray menu
            let quit_i = MenuItem::with_id(app, "quit", "Quit VibeDev", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let capture_i = MenuItem::with_id(app, "capture", "Quick Capture", true, Some("Cmd+Shift+V"))?;

            let menu = Menu::with_items(app, &[&show_i, &capture_i, &quit_i])?;

            // Build the tray icon
            let _tray = TrayIconBuilder::new()
                .icon(Image::from_path("icons/icon.png")?)
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        toggle_window(app);
                    }
                    "capture" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("trigger-capture", ());
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_window(app);
                    }
                })
                .build(app)?;

            // Register global shortcuts
            app.global_shortcut()
                .on_shortcut("CmdOrCtrl+Shift+V", |app, _shortcut, _event| {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("trigger-capture", ());
                        let _ = position_window_near_tray(&window);
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                })
                .map_err(|e| format!("Failed to register Cmd+Shift+V: {}", e))?;

            app.global_shortcut()
                .on_shortcut("CmdOrCtrl+Shift+S", |app, _shortcut, _event| {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("trigger-screenshot", ());
                        let _ = position_window_near_tray(&window);
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                })
                .map_err(|e| format!("Failed to register Cmd+Shift+S: {}", e))?;

            app.global_shortcut()
                .on_shortcut("CmdOrCtrl+Shift+R", |app, _shortcut, _event| {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("trigger-recording", ());
                        let _ = position_window_near_tray(&window);
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                })
                .map_err(|e| format!("Failed to register Cmd+Shift+R: {}", e))?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_capture_stats,
            quick_capture,
            take_screenshot,
            start_recording,
            hide_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
