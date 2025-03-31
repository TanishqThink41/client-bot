import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
// import LaptopView from "./components/Laptop.jsx";
import PhoneView from "./components/Phone.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/laptop" element={<LaptopView />} /> */}
      <Route path="/phone" element={<PhoneView />} />
    </Routes>
  );
}

export default App;