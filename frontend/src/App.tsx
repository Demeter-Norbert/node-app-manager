import { useState, useEffect } from "react";
import { DockerContainer } from "./types/docker";
import { fetchContainers } from "./services/api";
import DockerTable from "./components/DockerTable";
import "./App.css";

function App() {
  const [apps, setApps] = useState<DockerContainer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const data = await fetchContainers();
      setApps(data);
    } catch (err) {
      console.error(err);
      setError("Connection error. Is the backend running?");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Docker Manager Dashboard</h1>
      
      <button 
        onClick={loadData} 
        style={{ padding: "10px 20px", cursor: "pointer", marginBottom: "20px" }}
      >
        Refresh
      </button>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
      
      {!error && <DockerTable containers={apps} />}
    </div>
  );
}

export default App;