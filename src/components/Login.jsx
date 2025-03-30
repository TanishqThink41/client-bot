import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceType, setDeviceType] = useState("laptop");
  const [message, setMessage] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, deviceType }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.deviceType === "laptop") {
          window.location.href = "/laptop";
        } else {
          window.location.href = "/phone";
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Login error");
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: </label>
          <input 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Password: </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Device Type: </label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
          >
            <option value="laptop">Laptop</option>
            <option value="phone">Phone</option>
          </select>
        </div>
        <button style={{ marginTop: 10 }} type="submit">
          Login
        </button>
      </form>
      <p style={{ marginTop: 10 }}>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}