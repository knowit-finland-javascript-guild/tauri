use std::{ thread, time };

use serde::Serialize;
use sysinfo::System;
use tauri::{ async_runtime, AppHandle, Emitter };

#[derive(Serialize, Clone)]
struct Process {
    pid: u32,
    name: String,
    cpu: f32,
    memory: u64,
}

#[derive(Serialize, Clone)]
struct SystemInfo {
    system_name: Option<String>,
    kernel_version: Option<String>,
    os_version: Option<String>,
    host_name: Option<String>,
    memory_usage: u64,
    cpu_usage: f32,
    processes: Vec<Process>,
}

fn update_system_info(app: &AppHandle) {
    let mut sys = System::new_all();
    sys.refresh_cpu_usage();
    app.emit("update_system_info", SystemInfo {
        system_name: System::name(),
        kernel_version: System::kernel_version(),
        os_version: System::os_version(),
        host_name: System::host_name(),
        memory_usage: sys.used_memory(),
        cpu_usage: sys.global_cpu_usage(),
        processes: sys
            .processes()
            .iter()
            .map(|(pid, process)| {
                Process {
                    pid: pid.as_u32(),
                    name: process.name().to_str().unwrap().to_string(),
                    cpu: process.cpu_usage(),
                    memory: process.memory(),
                }
            })
            .collect(),
    }).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .setup(|app| {
            let handle = app.handle().clone();
            async_runtime::spawn(async move {
                loop {
                    update_system_info(&handle);
                    thread::sleep(time::Duration::from_millis(1000));
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
