import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import LaptopView from "./components/Laptop.jsx";
import PhoneView from "./components/Phone.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/laptop" element={<LaptopView />} />
      <Route path="/phone" element={<PhoneView />} />
    </Routes>
  );
}

export default App;