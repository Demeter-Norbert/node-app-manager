import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/apps/');
      setApps(response.data.apps);
      setError(null);
    } catch (err) {
      setError('Request error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="container">
      <h1>Manager</h1>
      
      <button onClick={fetchApps} style={{ marginBottom: '20px' }}>
        Refresh
      </button>

      {loading && <p>Loading ... </p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && apps.length === 0 && (
        <p>There are no managed apps</p>
      )}

      {!loading && !error && apps.length > 0 && (
        <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f4f4f4', color: '#333' }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td><strong>{app.name}</strong></td>
                <td>{app.image}</td>
                <td>
                  <span style={{ 
                    color: app.status === 'running' ? 'green' : 'red',
                    fontWeight: 'bold' 
                  }}>
                    {app.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App