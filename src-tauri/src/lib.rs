use std::ffi::OsString;
use std::iter::once;
use std::os::windows::ffi::OsStrExt;
use std::os::windows::ffi::OsStringExt;
use std::process::Command;
use std::ptr;
use std::sync::Mutex;
use tauri::command;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIcon;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{Target, TargetKind};
use winapi::um::winnt::KEY_WOW64_32KEY;
use winapi::um::winreg::{RegOpenKeyExW, RegQueryValueExW};
use winapi::{
    shared::minwindef::{DWORD, HKEY},
    shared::winerror::ERROR_SUCCESS,
    um::winnt::{KEY_READ, REG_SZ},
    um::winreg::{RegCloseKey, HKEY_CURRENT_USER},
};
use windows::Win32::{
    Foundation::{HWND, LPARAM},
    Graphics::Gdi::{
        EnumFontFamiliesExW, TEXTMETRICW,GetDC, ReleaseDC, DEFAULT_CHARSET, LF_FACESIZE, LOGFONTW,
    },
    UI::WindowsAndMessaging::GetDesktopWindow,
};
mod store;
struct AppState {
    tray: Mutex<Option<TrayIcon>>,
}
// 包含编译时生成的构建信息
include!(concat!(env!("OUT_DIR"), "/build_number.rs"));
#[tauri::command]
fn build_timestamp() -> String {
    BUILD_NUMBER.to_string()
}

fn show_window(app: &AppHandle, _args: Vec<String>) {
    let windows = app.webview_windows();
    println!("收到启动参数...{}", _args.join(","));
    if let Some(window) = windows.values().next() {
        if let Err(e) = window.show() {
            eprintln!("无法显示窗口: {}", e);
        }
        if let Err(e) = window.unminimize() {
            eprintln!("无法解除窗口最小化: {}", e);
        }
        if let Err(e) = window.set_focus() {
            eprintln!("无法设置窗口焦点: {}", e);
        }
    }
    // 跳过第 0 个参数（可执行文件路径）
    let args: Vec<String> = _args.into_iter().skip(1).collect();
    if !args.is_empty() {
        println!("收到文件路径列表: {:?}", args);

        // 发送给前端
        if let Err(e) = app.emit("open-files", args) {
            eprintln!("发送参数到前端失败: {}", e);
        }
    }
}
fn to_wide_null(s: &str) -> Vec<u16> {
    OsString::from(s).encode_wide().chain(once(0)).collect()
}


#[tauri::command]
fn list_system_fonts() -> Vec<String> {
    let mut fonts: Vec<String> = Vec::new();

    unsafe {
        // 获取桌面窗体 HDC
        let hwnd: HWND = GetDesktopWindow();
        let hdc = GetDC(hwnd);

        // 初始化 LOGFONTW（全0）
        let mut logfont: LOGFONTW = std::mem::zeroed();
        // 直接赋 DEFAULT_CHARSET（类型匹配）
        logfont.lfCharSet = DEFAULT_CHARSET;

        // 传入 fonts 的指针（转成 isize）到回调
        let lparam = LPARAM(&mut fonts as *mut _ as isize);

        EnumFontFamiliesExW(
            hdc,
            &mut logfont,
            Some(enum_font_proc),
            lparam,
            0,
        );

        ReleaseDC(hwnd, hdc);
    }

    // 排序并去重
    fonts.sort();
    fonts.dedup();
    fonts
}

/// 使用 LOGFONTW / TEXTMETRICW 作为回调参数，兼容性最好
unsafe extern "system" fn enum_font_proc(
    elf: *const LOGFONTW,
    _ntm: *const TEXTMETRICW,
    _font_type: u32,
    lparam: LPARAM,
) -> i32 {
    if elf.is_null() {
        return 1;
    }

    // 恢复 Vec<String> 的可变引用
    let fonts: &mut Vec<String> = &mut *(lparam.0 as *mut Vec<String>);

    // 读取 lfFaceName（UTF-16, 固定长度 LF_FACESIZE）
    let name_wide = &(*elf).lfFaceName;
    let len = name_wide.iter().position(|&c| c == 0).unwrap_or(LF_FACESIZE as usize);
    let os = OsString::from_wide(&name_wide[..len]);

    if let Ok(s) = os.into_string() {
        if !fonts.contains(&s) {
            fonts.push(s);
        }
    }

    1 // 返回 1 表示继续枚举
}

#[tauri::command]
fn update_tray_menu_item_title(
    app: tauri::AppHandle,
    quit: String,
    show: String,
    tooltip: String,
    switch: String,
) {
    let app_handle = app.app_handle();
    let state: State<AppState> = app.state();
    // 获取托盘
    let mut tray_lock = state.tray.lock().unwrap();
    let tray = match tray_lock.as_mut() {
        Some(tray) => tray,
        None => {
            eprintln!("Tray icon not found");
            return;
        }
    };

    // 创建菜单项
    let quit_i = match MenuItem::with_id(app_handle, "quit", quit, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单项
    let show_i = match MenuItem::with_id(app_handle, "show", show, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单项
    let switch = match MenuItem::with_id(app_handle, "switch", switch, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    let separator = match PredefinedMenuItem::separator(app_handle) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单
    let menu = match Menu::with_items(app_handle, &[&show_i, &switch, &separator, &quit_i]) {
        Ok(menu) => menu,
        Err(e) => {
            eprintln!("Failed to create menu: {}", e);
            return;
        }
    };
    // 设置菜单
    if let Err(e) = tray.set_menu(Some(menu)) {
        eprintln!("Failed to set tray menu: {}", e);
    } else {
        println!("菜单项标题已更新");
    }
    if let Err(e) = tray.set_tooltip(Some(tooltip)) {
        eprintln!("Failed to set tray menu: {}", e);
    } else {
        println!("托盘标题已更新");
    }
}
#[command]
fn get_install_path() -> Result<String, String> {
    fn to_wide_null(s: &str) -> Vec<u16> {
        OsString::from(s).encode_wide().chain(once(0)).collect()
    }

    let key_path = "Software\\FlySky\\E\\Install";
    let value_name = "Path";

    let key_path_w = to_wide_null(key_path);
    let value_name_w = to_wide_null(value_name);

    unsafe {
        let mut hkey: HKEY = ptr::null_mut();
        let access = KEY_READ | KEY_WOW64_32KEY;

        let open_status =
            RegOpenKeyExW(HKEY_CURRENT_USER, key_path_w.as_ptr(), 0, access, &mut hkey);

        if open_status != ERROR_SUCCESS as i32 {
            return Err(format!("无法打开注册表键: 错误码 {}", open_status));
        }

        let mut data_type: DWORD = 0;
        let mut data_size: DWORD = 0;
        let query_status = RegQueryValueExW(
            hkey,
            value_name_w.as_ptr(),
            ptr::null_mut(),
            &mut data_type,
            ptr::null_mut(),
            &mut data_size,
        );

        if query_status != ERROR_SUCCESS as i32 || data_type != REG_SZ {
            RegCloseKey(hkey);
            return Err(format!(
                "无法查询值 Path (状态: {}, 类型: {})",
                query_status, data_type
            ));
        }

        let mut buffer: Vec<u16> = vec![0; (data_size as usize / 2) + 1];
        let mut actual_size = data_size;

        let read_status = RegQueryValueExW(
            hkey,
            value_name_w.as_ptr(),
            ptr::null_mut(),
            ptr::null_mut(),
            buffer.as_mut_ptr() as *mut u8,
            &mut actual_size,
        );

        RegCloseKey(hkey);

        if read_status != ERROR_SUCCESS as i32 {
            return Err(format!("读取值失败: 状态码 {}", read_status));
        }

        let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
        let value = String::from_utf16_lossy(&buffer[..len]);
        Ok(value)
    }
}
#[command]
fn reveal_file(file_path: &str) -> Result<String, String> {
    Command::new("explorer")
        .arg("/select,")
        .arg(file_path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok("success".into())
}

#[command]
fn get_epl_recent_files() -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    let key_path = "Software\\FlySky\\E\\Recent File List";
    println!("[DEBUG] 注册表路径: {}", key_path);

    // 转为宽字符串
    let key_path_w = to_wide_null(key_path);

    unsafe {
        let mut hkey: HKEY = ptr::null_mut();
        // 64 位进程访问 32 位视图
        let access = KEY_READ | KEY_WOW64_32KEY;
        println!("[DEBUG] 访问标志: 0x{:X}", access);

        // 尝试打开注册表键
        let status = RegOpenKeyExW(HKEY_CURRENT_USER, key_path_w.as_ptr(), 0, access, &mut hkey);
        if status != ERROR_SUCCESS as i32 {
            // 打不开就打印日志，但不返回 Err，而是返回 Ok(empty_list)
            println!("[ERROR] 打开键失败 (code: {})", status);
            return Ok(files);
        }
        println!("[SUCCESS] 打开注册表键成功");

        // 读取 File1, File2 ... File20
        for idx in 1..=20 {
            let name = format!("File{}", idx);
            let name_w = to_wide_null(&name);

            // 先查询值类型和大小
            let mut vtype: DWORD = 0;
            let mut datasz: DWORD = 0;
            let ret = RegQueryValueExW(
                hkey,
                name_w.as_ptr(),
                ptr::null_mut(),
                &mut vtype,
                ptr::null_mut(),
                &mut datasz,
            );
            if ret != ERROR_SUCCESS as i32 {
                println!("[INFO] 值 {} 不存在，结束读取", name);
                break;
            }
            if vtype != REG_SZ || datasz == 0 {
                println!("[WARN] 跳过值 {} (type={}, size={})", name, vtype, datasz);
                continue;
            }

            // 读取实际数据
            // datasz 单位是「字节」，要转成 u16 数组长度 = datasz / 2
            let mut buf: Vec<u16> = vec![0; (datasz as usize / 2) + 1];
            let mut read_sz = datasz;
            let ret2 = RegQueryValueExW(
                hkey,
                name_w.as_ptr(),
                ptr::null_mut(),
                ptr::null_mut(),
                buf.as_mut_ptr() as *mut u8,
                &mut read_sz,
            );
            if ret2 != ERROR_SUCCESS as i32 {
                println!("[ERROR] 读取 {} 失败 (code: {})", name, ret2);
                continue;
            }

            // 去掉末尾的 \0，转 UTF-16 -> UTF-8
            let len = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
            let path = String::from_utf16_lossy(&buf[..len]);
            println!("[SUCCESS] 找到文件: {}", path);
            files.push(path);
        }

        RegCloseKey(hkey);
    }

    println!("[RESULT] 共找到 {} 个最近文件", files.len());
    Ok(files)
}

#[tauri::command]
fn open_exe(exe_path: &str, args: Vec<String>) -> i32 {
    println!("{:?}", args);
    match Command::new(exe_path).args(&args).spawn() {
        Ok(_) => 0,  // 启动成功，返回0
        Err(_) => 1, // 启动失败，返回1
    }
}
#[tauri::command]
fn is_running_in_msix() -> bool {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(dir) = exe_path.parent() {
            let dir_str = dir.to_string_lossy().to_lowercase();
            return dir_str.starts_with(r"c:\program files\windowsapps");
        }
    }
    false
}
#[tauri::command]
fn is_debug_build() -> bool {
    cfg!(debug_assertions)
}

#[tauri::command]
async fn verify_license() -> Result<bool, String> {
    store::verify_purchase()
        .await
        .map_err(|e| format!("许可证验证失败: {:?}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        tauri::Builder::default()
            .setup(|app| {
                // 正确获取 app_handle 并克隆它
                let app_handle = app.app_handle().clone(); // 关键修复：添加 clone()
                tauri::async_runtime::spawn(async move {
                    match verify_license().await {
                        Ok(valid) => {
                            if !valid {
                                let _ = app_handle.emit("license-status", "请从微软商店购买正式版");
                            }
                        }
                        Err(e) => {
                            let _ = app_handle.emit("license-error", format!("验证错误: {}", e));
                        }
                    }
                });
                Ok(())
            })
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_os::init())
            .plugin(
                tauri_plugin_log::Builder::new()
                    .targets([
                        Target::new(TargetKind::Folder {
                            path: std::path::PathBuf::from("/logs"),
                            file_name: Some("app.log".to_string()),
                        }),
                        Target::new(TargetKind::Stdout),
                        Target::new(TargetKind::LogDir { file_name: None }),
                        Target::new(TargetKind::Webview),
                    ])
                    .build(),
            )
            .plugin(tauri_plugin_persisted_scope::init())
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                show_window(app, _args);
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                None,
            ))
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_opener::init())
            .manage(AppState {
                tray: Mutex::new(None),
            })
            .invoke_handler(tauri::generate_handler![
                update_tray_menu_item_title,
                get_epl_recent_files,
                reveal_file,
                get_install_path,
                open_exe,
                build_timestamp,
                is_running_in_msix,
                is_debug_build,
                verify_license,
                list_system_fonts
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
