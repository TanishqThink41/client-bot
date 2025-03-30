import React, { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Registered successfully. You can now login.");
      } else {
        setMsg(data.message);
      }
    } catch (error) {
      console.log(error);
      setMsg("Error occurred during registration.");
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username: </label>
          <input 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Password: </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
          />
        </div>
        <button style={{ marginTop: 10 }} type="submit">
          Register
        </button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}