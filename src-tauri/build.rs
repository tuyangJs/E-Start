use std::{env, fs, io::Write, path::Path};
use chrono::{Local, Datelike};

fn main() {
    tauri_build::build(); // 初始化 Tauri 构建环境

    // 获取输出目录
    let out_dir = env::var("OUT_DIR").expect("OUT_DIR 未定义");
    let store = Path::new(&out_dir).join("build_counter.txt");

    // 获取当前日期
    let now = Local::now();
    let year = now.year() % 100; // 获取年份后两位
    let day_of_year = now.ordinal(); // 获取当前日期是当年的第几天
    let yyddd = format!("{:02}{:03}", year, day_of_year);

    // 读取之前的编译次数
    let (prev_date, mut count) = if let Ok(text) = fs::read_to_string(&store) {
        let parts: Vec<_> = text.trim().split(':').collect();
        if parts.len() == 2 && parts[0] == yyddd {
            (parts[0].to_string(), parts[1].parse::<u32>().unwrap_or(0))
        } else {
            (yyddd.clone(), 0)
        }
    } else {
        (yyddd.clone(), 0)
    };

    // 更新编译次数
    if prev_date == yyddd {
        count = count.saturating_add(1);
        if count >= 100 {
            count = 0;
        }
    } else {
        count = 0;
    }

    // 保存新的编译次数
    fs::write(&store, format!("{}:{:02}", yyddd, count)).unwrap();

    // 生成构建号
    let build_num = format!("{}{:02}", yyddd, count);
    let dest = Path::new(&out_dir).join("build_number.rs");
    let mut f = fs::File::create(&dest).unwrap();
    write!(f, "pub const BUILD_NUMBER: &str = \"{}\";", build_num).unwrap();
}
