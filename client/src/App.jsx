import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkBackend() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setError(`Could not reach the backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>RelayLedger</h1>
      <p>Clear treasury records. Better handovers.</p>

      <button onClick={checkBackend} disabled={loading}>
        {loading ? "Checking..." : "Check backend connection"}
      </button>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default App;
