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
  - ```xcode-select --install```
- Install Rust
  - ```curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh```

### Recommended VS Code extensions

- Rust
  - Contains language server and rust-analyzer for error highlighting
- Rust prettier
  - Auto formatting code for better readability (Alt+Shift+F)

## Step 1

### Initializing the app

- Run ```npm create tauri-app@latest``` (note that in Windows this must be run in Powershell, VS Code integrated terminal or Windows terminal, Git bash does not work)
- Select preferred project framework
- Install node dependencies
- Run command ```npm run tauri dev``` to start the example app

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
import { invoke } from '@tauri-apps/api/core'
// When using the Tauri global script (if not using the npm package)
// Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.invoke

// Invoke the command
invoke('my_custom_command')
```

Commands can return a value when they are awaited and they can be passed a list of arguments in the invoke call (note that arguments must be defined in snake_case in the backend, and in camelCase in the frontend).

- Create new command handler `generate_header_text` to `src-tauri/src/lib.rs`
- Apply the handler in builder
- Call the command from frontend with invoke
- Display return value as header