import { DockerContainer } from "../types/docker";
import { formatPorts } from "../utils/formatters";
import { stopApp, resumeApp, restartApp, deleteApp } from "../services/api";
import { Play, Square, RotateCw, Trash2, Server } from "lucide-react";

interface DockerTableProps {
  containers: DockerContainer[];
  onRefresh: () => void;
}

export default function DockerTable({ containers, onRefresh }: DockerTableProps) {
  if (!Array.isArray(containers)) {
    return <div className="p-6 text-red-500">Data loading error.</div>;
  }

  if (containers.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center">
        <Server size={48} className="mb-4 opacity-20" />
        <p>No running applications found.</p>
      </div>
    );
  }

  const handleAction = async (actionFn: (id: string) => Promise<any>, id: string) => {
    try {
      await actionFn(id);
      onRefresh();
    } catch (error) {
      console.error("Action failed", error);
      alert("An error occurred while executing the action.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-950/50 text-gray-400">
          <tr>
            <th className="px-6 py-4 font-medium">ID</th>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Ports</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {containers.map((app, index) => {
            const isRunning = app?.status?.includes("running") || app?.status?.includes("Up");
            
            return (
              <tr key={app?.id || index} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-gray-500 font-mono">
                  {app?.id ? app.id.substring(0, 12) : "..."}
                </td>
                <td className="px-6 py-4 font-medium text-gray-200">
                  {app?.name || "Unknown"}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isRunning 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                    {isRunning ? "Running" : "Stopped"}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {formatPorts(app?.ports)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isRunning ? (
                      <button 
                        onClick={() => handleAction(stopApp, app.id)}
                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-md transition-colors"
                        title="Stop"
                      >
                        <Square size={16} fill="currentColor" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction(resumeApp, app.id)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-gray-800 rounded-md transition-colors"
                        title="Start"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleAction(restartApp, app.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-md transition-colors"
                      title="Restart"
                    >
                      <RotateCw size={16} />
                    </button>
                    <button 
                      onClick={() => handleAction(deleteApp, app.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors ml-2"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}