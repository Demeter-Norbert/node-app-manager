import { useState, useEffect, useMemo } from "react";
import { DockerContainer } from "./types/docker";
import { fetchContainers, startApp } from "./services/api";
import DockerTable from "./components/DockerTable";
import SystemChart from "./components/SystemChart";
import { useSystemMonitor } from "./hooks/useSystemMonitor";
import { Server, Plus, RefreshCw, AlertCircle, Cpu, MemoryStick } from "lucide-react";

function App() {
  const [apps, setApps] = useState<DockerContainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [appName, setAppName] = useState("");
  const [appPort, setAppPort] = useState("");
  const [appImage, setAppImage] = useState("node:18-alpine");

  const loadData = async () => {
    try {
      setError(null);
      const data = await fetchContainers();
      setApps(data);
    } catch (err) {
      setError("Failed to connect to the backend.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runningIds = useMemo(() => {
    return apps.filter(a => a.status.includes("running") || a.status.includes("Up")).map(a => a.id);
  }, [apps]);

  const { currentStats, history } = useSystemMonitor(runningIds);

  const totalCpu = Object.values(currentStats).reduce((acc, curr) => acc + (curr.cpu_percent || 0), 0);
  const totalMemMb = Object.values(currentStats).reduce((acc, curr) => acc + (curr.memory_usage_bytes || 0), 0) / (1024 * 1024);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appPort || !appImage) return alert("Please provide name, port, and image!");
    try {
      await startApp(appName, parseInt(appPort), appImage);
      setAppName(""); setAppPort(""); setAppImage("node:18-alpine");
      loadData();
    } catch (err) {
      alert("An error occurred while creating the application.");
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
            <Server size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Node.js Manager</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors border border-gray-700">
          <RefreshCw size={18} /> Refresh
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
          <AlertCircle size={20} /> <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Server size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Running Apps</p>
            <p className="text-2xl font-bold">{runningIds.length}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><Cpu size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total CPU Usage</p>
            <p className="text-2xl font-bold">{totalCpu.toFixed(1)} %</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg"><MemoryStick size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total RAM Usage</p>
            <p className="text-2xl font-bold">{totalMemMb.toFixed(0)} MB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-200">
              <Plus size={20} className="text-blue-500" /> Start New App
            </h3>
            <form onSubmit={handleCreateApp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Application Name</label>
                <input type="text" placeholder="e.g. my-node-api" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Docker Image</label>
                <input type="text" placeholder="e.g. node:20-alpine" value={appImage} onChange={(e) => setAppImage(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Port</label>
                <input type="number" placeholder="e.g. 3000" value={appPort} onChange={(e) => setAppPort(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Deploy</button>
            </form>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hidden lg:block">
             <h3 className="text-lg font-semibold text-gray-200 mb-2">Resource Monitor</h3>
             <SystemChart data={history} />
          </div>

        </div>

        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            {!error && <DockerTable containers={apps} onRefresh={loadData} stats={currentStats} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;