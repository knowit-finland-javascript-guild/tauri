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

const exampleData: SystemInfo = {
  system_name: "Windows",
  kernel_version: "1",
  os_version: "1",
  host_name: "Knowit",
  memory_usage: 1000,
  cpu_usage: 50,
};

function App() {
  const [headerText, setHeaderText] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState(exampleData);

  useEffect(() => {
    invoke<string>("generate_header_text", { operatingSystem: "Windows" }).then(
      (text) => setHeaderText(text)
    );
  }, []);

  return (
    <div>
      <p>{headerText}</p>
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
