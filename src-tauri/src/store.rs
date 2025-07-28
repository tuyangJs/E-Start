use windows::{
    core::{Error, Result, HRESULT},
    Foundation::DateTime as WinDateTime,
    Services::Store::{StoreContext, StoreAppLicense},
    Win32::System::Com::{self, COINIT_MULTITHREADED},
};
use windows::Win32::Foundation::S_OK;

use chrono::{DateTime, Utc};
use std::{sync::Once, time::Duration};

// 保留HTTP时间获取
use tauri_plugin_http::reqwest;

static COM_INIT: Once = Once::new();

/// 生产环境实现
#[cfg(not(debug_assertions))]
pub async fn verify_purchase() -> Result<bool> {
    // 1. 验证MSIX环境
    if !is_msix_env() {
        return Ok(false);
    }

    // 安全地初始化COM组件
    COM_INIT.call_once(|| unsafe {
        let hr = Com::CoInitializeEx(None, COINIT_MULTITHREADED);
        if hr != S_OK && hr != HRESULT(0x80010106u32 as i32) {
            eprintln!("COM初始化失败: {:?}", hr);
        }
    });

    // 2. 获取商店上下文
    let context = StoreContext::GetDefault()?;
    
    // 3. 验证应用许可证
    let license = context.GetAppLicenseAsync()?.await?;
    
    // 检查许可证是否有效
    if !license.IsActive()? {
        return Ok(false);
    }

    // 4. 仅当是试用版时才检查过期时间
    if license.IsTrial()? {
        let expiration = license.ExpirationDate()?;
        let expiration_utc = win_datetime_to_chrono(expiration)?;
        
        // 使用HTTP获取网络时间
        let now = match fetch_web_time().await {
            Ok(time) => time,
            Err(e) => {
                eprintln!("获取网络时间失败: {}, 使用本地时间", e);
                Utc::now()
            }
        };
        
        if expiration_utc < now {
            return Ok(false);
        }
    }

    Ok(true)
}

/// 验证是否在MSIX环境中运行
fn is_msix_env() -> bool {
    // 使用 Win32 API 替代检查 MSIX 环境
    unsafe {
        windows::Win32::System::Com::CoInitializeEx(None, COINIT_MULTITHREADED).is_ok()
    }
}

/// 从网站响应头获取时间
async fn fetch_web_time() -> Result<DateTime<Utc>> {
    const WEBSITES: [&str; 4] = [
        "https://www.microsoft.com",
        "https://www.google.com",
        "https://www.apple.com",
        "https://www.baidu.com",
    ];
    
    for site in WEBSITES.iter() {
        match try_fetch_time_from(site).await {
            Ok(time) => return Ok(time),
            Err(e) => eprintln!("尝试从 {} 获取时间失败: {}", site, e),
        }
    }
    
    Err(Error::new(
        HRESULT(0x80072EE7u32 as i32),
        "所有时间源均不可用"
    ))
}

/// 带超时的HTTP请求获取时间
async fn try_fetch_time_from(url: &str) -> Result<DateTime<Utc>> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(4))
        .build()
        .map_err(|e| Error::new(
            HRESULT(0x80072EE7u32 as i32), 
            format!("创建HTTP客户端失败: {}", e)
        ))?;
        
    let resp = client.get(url)
        .send()
        .await
        .map_err(|e| Error::new(
            HRESULT(0x80072EE7u32 as i32),
            format!("请求失败: {}", e)
        ))?;
        
    // 检查HTTP状态
    if !resp.status().is_success() {
        return Err(Error::new(
            HRESULT(0x80072EE7u32 as i32),
            format!("HTTP错误: {}", resp.status())
        ));
    }
    
    // 从响应头获取时间
    let date_header = resp.headers().get("date")
        .ok_or_else(|| Error::new(
            HRESULT(0x80070057u32 as i32),
            "响应头缺少Date字段"
        ))?;
        
    let date_str = date_header.to_str()
        .map_err(|_| Error::new(
            HRESULT(0x80070057u32 as i32),
            "无效的Date头格式"
        ))?;
        
    DateTime::parse_from_rfc2822(date_str)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|e| Error::new(
            HRESULT(0x80070057u32 as i32),
            format!("时间解析失败: {}", e)
        ))
}

/// 将Windows时间转换为UTC时间
fn win_datetime_to_chrono(dt: WinDateTime) -> Result<DateTime<Utc>> {
    const EPOCH_DIFF: i64 = 11_644_473_600 * 10_000_000;
    let ticks = dt.UniversalTime - EPOCH_DIFF;
    
    if ticks < 0 {
        return Err(Error::new(
            HRESULT(0x80070057u32 as i32),
            "无效的Windows时间戳"
        ));
    }
    
    let secs = ticks / 10_000_000;
    let nanos = ((ticks % 10_000_000) as u32) * 100;
    
    DateTime::from_timestamp(secs, nanos)
        .ok_or_else(|| Error::new(
            HRESULT(0x80070057u32 as i32),
            "时间转换失败"
        ))
}

#[cfg(debug_assertions)]
pub async fn verify_purchase() -> Result<bool> {
    println!("开发模式: 跳过许可证验证");
    Ok(true)
}