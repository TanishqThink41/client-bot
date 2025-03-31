import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
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
        navigate("/phone");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Login error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-green-400">
      <div className="w-full max-w-md p-6 bg-gray-900 border border-green-500 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-green-300 mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username:</label>
            <input
              className="w-full px-3 py-2 bg-gray-800 border border-green-500 rounded-lg text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password:</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-800 border border-green-500 rounded-lg text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-red-400 text-center">{message}</p>}
      </div>
    </div>
  );
}