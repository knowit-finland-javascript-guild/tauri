import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface SystemInfo {
  system_name?: string;
  kernel_version?: string;
  os_version?: string;
  host_name?: string;
  memory_usage: number;
  cpu_usage: number;
}

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    invoke<SystemInfo>("get_system_info", { operatingSystem: "Windows" }).then(
      setSystemInfo
    );
  }, []);

  if (!systemInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>System name: {systemInfo.system_name}</p>
      <p>Kernel version: {systemInfo.kernel_version}</p>
      <p>OS version: {systemInfo.os_version}</p>
      <p>Host name: {systemInfo.host_name}</p>
      <p>Memory usage: {systemInfo.memory_usage}B</p>
      <p>CPU usage: {systemInfo.cpu_usage}%</p>
    </div>
  );
}

export default App;
