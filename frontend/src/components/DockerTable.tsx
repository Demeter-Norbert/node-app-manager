import { DockerContainer } from "../types/docker";
import { formatPorts } from "../utils/formatters";

interface DockerTableProps {
  containers: DockerContainer[];
}

export default function DockerTable({ containers }: DockerTableProps) {
  if (!Array.isArray(containers)) {
    return (
      <div style={{ color: "red", marginTop: "20px" }}>
        <strong>Render Error:</strong> The backend did not send a list! 
        <br/>
        Received: {JSON.stringify(containers).substring(0, 100)}...
      </div>
    );
  }

  if (containers.length === 0) {
    return <p>No running containers found.</p>;
  }

  return (
    <table border={1} style={{ width: "100%", textAlign: "left", marginTop: "20px", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ padding: "8px" }}>ID</th>
          <th style={{ padding: "8px" }}>Name</th>
          <th style={{ padding: "8px" }}>Status</th>
          <th style={{ padding: "8px" }}>Ports</th>
          <th style={{ padding: "8px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {containers.map((app, index) => (
          <tr key={app?.id || index}>
            <td style={{ padding: "8px" }}>{app?.id ? app.id.substring(0, 12) : "Missing ID"}</td>
            <td style={{ padding: "8px", fontWeight: "bold" }}>{app?.name || "Unknown"}</td>
            <td style={{ 
              padding: "8px", 
              color: app?.status?.includes("running") || app?.status?.includes("Up") ? "green" : "red",
              fontWeight: "bold"
            }}>
              {app?.status || "Unknown"}
            </td>
            <td style={{ padding: "8px" }}>{formatPorts(app?.ports)}</td>
            <td style={{ padding: "8px" }}>
              <i></i>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}