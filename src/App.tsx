import { ChangeEvent, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore(".settings.dat");

interface SystemInfo {
  system_name?: string;
  kernel_version?: string;
  os_version?: string;
  host_name?: string;
  memory_usage: number;
  cpu_usage: number;
}

const fonts = ["Arial", "Wingdings 3", "Comic Sans MS"];

function App() {
  const [font, setFont] = useState<string>();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const updateFont = async (e: ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    setFont(font);
    await store.set("font", font);
    await store.save();
  };

  useEffect(() => {
    const listener = listen<SystemInfo>("update_system_info", (e) =>
      setSystemInfo(e.payload)
    );
    store.get<string | null>("font").then((font) => {
      setFont(font ?? fonts[0]);
    });
    return () => {
      listener.then((unlisten) => unlisten());
    };
  }, []);

  if (!systemInfo || !font) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <style>
        {`* {
          font-family: '${font}';
        }`}
      </style>
      <p>System name: {systemInfo.system_name}</p>
      <p>Kernel version: {systemInfo.kernel_version}</p>
      <p>OS version: {systemInfo.os_version}</p>
      <p>Host name: {systemInfo.host_name}</p>
      <p>Memory usage: {systemInfo.memory_usage}B</p>
      <p>CPU usage: {systemInfo.cpu_usage}%</p>
      <select onChange={updateFont}>
        {fonts.map((f) => (
          <option selected={f === font}>{f}</option>
        ))}
      </select>
    </div>
  );
}

export default App;
