import React, { useState, useEffect } from "react";
import "./index.css";

const VAULT_PASSWORD = "Database@1234";

function VaultView() {
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [vaultItems, setVaultItems] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    if (inputPassword === VAULT_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError(" Incorrect password. Access denied.");
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchVaultData();
    }
  }, [authenticated]);

  const fetchVaultData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/passwords");
      const data = await response.json();
      setVaultItems(data);
    } catch (err) {
      console.error("Failed to fetch vault contents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/passwords/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) fetchVaultData();
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!authenticated) {
    return (
      <div className="vault-container">
        <h1> Database Access</h1>
        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <label htmlFor="vaultPassword">Enter Access Password</label>
            <input
              type="password"
              id="vaultPassword"
              placeholder="••••••••••••"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn-submit">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="vault-container">
      <h1> Stored Database Entries</h1>

      {loading && <p className="empty-state">Loading...</p>}

      <div className="card-grid">
        {vaultItems.map((item) => {
          const isRevealed = visiblePasswords[item.id];
          return (
            <div key={item.id} className="vault-card">
              <h3 className="card-title">{item.site_name}</h3>
              <p className="card-field">
                User: <span>{item.username}</span>
              </p>
              <p className="card-field">
                Pass: <span>{isRevealed ? item.password : "••••••••••••"}</span>
              </p>
              <p className="card-field card-meta">
                Added: <span>{new Date(item.created_at).toLocaleString()}</span>
              </p>

              <div className="card-actions">
                <button
                  className="btn-action btn-toggle"
                  onClick={() => togglePasswordVisibility(item.id)}
                >
                  {isRevealed ? "Hide" : "Reveal"}
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {vaultItems.length === 0 && !loading && (
        <p className="empty-state">No accounts saved yet. 🔐</p>
      )}
    </div>
  );
}

export default VaultView;
