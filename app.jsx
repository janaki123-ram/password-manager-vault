import React, { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const [form, setForm] = useState({
    site_name: "",
    username: "",
    password: "",
  });
  const [toast, setToast] = useState({ show: false, message: "" });
  const [emailError, setEmailError] = useState("");

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "username") {
      if (value && !EMAIL_REGEX.test(value)) {
        setEmailError(
          "Please enter a valid email address (e.g. name@example.com)",
        );
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.site_name || !form.username || !form.password) return;

    if (!EMAIL_REGEX.test(form.username)) {
      setEmailError(
        "Please enter a valid email address (e.g. name@example.com)",
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ site_name: "", username: "", password: "" });
        setEmailError("");
        showToast(" Account added successfully!");
      }
    } catch (err) {
      console.error("Error saving entry:", err);
    }
  };

  const handleShowDbInfo = () => {
    window.open("/vault-view", "_blank");
  };

  return (
    <div className="vault-container">
      <div className={`toast-popup ${toast.show ? "show" : ""}`}>
        <span>{toast.message}</span>
      </div>

      <h1> Secure Password Vault</h1>

      <form className="vault-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="site_name"
            placeholder="Website / App Name"
            value={form.site_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username / Email"
            value={form.username}
            onChange={handleInputChange}
            required
          />
          {emailError && <p className="field-error">{emailError}</p>}
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Add Account
        </button>
      </form>

      <div className="db-info-section">
        <button className="btn-db-info" onClick={handleShowDbInfo}>
           Show DB Info
        </button>
      </div>
    </div>
  );
}

export default App;
