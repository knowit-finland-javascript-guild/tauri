# Creating cross-platform applications with Tauri

## Prerequisites

[Guide at tauri documentation](https://v2.tauri.app/start/prerequisites/)

### Windows

- Install [Node.js](https://nodejs.org/en) (Only required if using JavaScript for frontend)
- Install [Visual Studio build tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Select MSVC and Windows 10/11 SDK
- Install [Rust](https://www.rust-lang.org/tools/install)
  - Most likely requires restarting the computer

### MacOS

- Install [Node.js](https://nodejs.org/en) (Only required if using JavaScript for frontend)
- Install development dependencies
  - `xcode-select --install`
- Install Rust
  - `curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh`

### Recommended VS Code extensions

- Rust
  - Contains language server and rust-analyzer for error highlighting
- Rust prettier
  - Auto formatting code for better readability (Alt+Shift+F)

## Step 1

### Initializing the app

- Run `npm create tauri-app@latest` (note that in Windows this must be run in Powershell, VS Code integrated terminal or Windows terminal, Git bash does not work)
- Select preferred project framework
- Install node dependencies
- Run command `npm run tauri dev` to start the example app

## Step 2

### Frontend

Developing the frontend does not differ much from regular UI development. There are some caveats when implementing some features that work out of the box in web (drag and drop for example), but we do not dive too deeply into those here.

- Modify frontend code to include mock data for system info
- Display the mock data

```ts
interface SystemInfo {
  system_name?: string;
  kernel_version?: string;
  os_version?: string;
  host_name?: string;
  memory_usage: number;
  cpu_usage: number;
}
```

## Step 3

### Calling backend with commands

[Documentation](https://tauri.app/v1/guides/features/command/)

Tauri provides api for calling the backend via commands. Commands must be added to the Tauri context when backend is started, and they can be called in two ways:

```js
// When using the Tauri API npm package:
import { invoke } from "@tauri-apps/api/core";
// When using the Tauri global script (if not using the npm package)
// Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.invoke;

// Invoke the command
invoke("my_custom_command");
```

Commands can return a value when they are awaited and they can be passed a list of arguments in the invoke call (note that arguments must be defined in snake_case in the backend, and in camelCase in the frontend).

- Create new command handler `generate_header_text` to `src-tauri/src/lib.rs`
- Apply the handler in builder
- Call the command from frontend with invoke
- Display return value as header

## Step 4

### Using Rust for low level operations

Previous example returned simple formatted string from the backend, but we can instead run low level operations and access resources that are normally outside of web applications scope.

Installing dependencies for the Rust backend is done via cargo in src-tauri directory. For this example we use [sysinfo](https://docs.rs/sysinfo/latest/sysinfo/) package to return current system resources.

- Run `cargo add sysinfo` in `src-tauri`
- Create handler for getting system information
- Call the handler from frontend and display the data

```rs
#[derive(Serialize)]
struct SystemInfo {
    system_name: Option<String>,
    kernel_version: Option<String>,
    os_version: Option<String>,
    host_name: Option<String>,
    memory_usage: u64,
    cpu_usage: f32,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new_all();
    sys.refresh_cpu_usage();

    SystemInfo {
        system_name: System::name(),
        kernel_version: System::kernel_version(),
        os_version: System::os_version(),
        host_name: System::host_name(),
        memory_usage: sys.used_memory(),
        cpu_usage: sys.global_cpu_usage(),
    }
}
```

## Step 5

### Events

Previous example returned system information by invoking a command to the backend, but we can use events instead to emit this information to the frontend.

[Documentation](https://v2.tauri.app/develop/calling-frontend/#listening-to-events-on-the-frontend)

- Spawn asynchronous loop to the backend, omitting system information every 1s as an event
- Listen to the event in frontend and update the information every time it changes

```rs
use std::{ thread, time };

use serde::Serialize;
use sysinfo::System;
use tauri::{ async_runtime, AppHandle, Emitter };

#[derive(Serialize, Clone)]
struct SystemInfo {
    system_name: Option<String>,
    kernel_version: Option<String>,
    os_version: Option<String>,
    host_name: Option<String>,
    memory_usage: u64,
    cpu_usage: f32,
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

```

```ts
useEffect(() => {
  const listener = listen<SystemInfo>("update_system_info", (e) =>
    setSystemInfo(e.payload)
  );
  return () => {
    listener.then((unlisten) => unlisten());
  };
}, []);
```

## Step 6

### Tauri Plugins

[Documentation](https://v2.tauri.app/develop/plugins/)

In previous example, we created our own logic for handling low level operations. Essentially this has no difference to what plugins are. Plugins are just collection of code that somebody has created, which can be applied to the backend and then be called from the frontend.

In this example we add plugin for creating a persistent key-value store using [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store/tree/v2), which we use to save theming options for the application.

- Run `cargo add tauri-plugin-store` in `src-tauri`
- Run `npm add @tauri-apps/plugin-store` in root folder
- Apply the plugin in builder
- Call store from frontend
- Add required permissions to `src-tauri/capabilities/default.json`

```rs
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
```

```tsx
const store = new LazyStore(".settings.dat");
const fonts = ["Arial", "Wingdings 3", "Comic Sans MS"];

store.get<string | null>("font").then((font) => {
  setFont(font ?? fonts[0]);
});

const updateFont = async (e: ChangeEvent<HTMLSelectElement>) => {
  const font = e.target.value;
  setFont(font);
  await store.set("font", font);
  await store.save();
};

<select onChange={updateFont}>
  {fonts.map((f) => (
    <option selected={f === font}>{f}</option>
  ))}
</select>;
```

## Bonus step

- List running processes as an array and send them to the frontend together with other system information
- Display processes in a table and move our application to the first row in the table