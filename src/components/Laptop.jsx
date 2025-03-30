import React, { useEffect, useState } from "react";

export default function LaptopView() {

  const BASE_URL = import.meta.env.VITE_BASE_URL
  const [textMessages, setTextMessages] = useState([]);
  const [selectedImageBase64, setSelectedImageBase64] = useState("");

  // SSE connection for receiving text from phone
  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}sse/laptop`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "text") {
        setTextMessages((prev) => [...prev, data.data]);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Laptop SSE error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Capture base64 image, but don't send immediately upon selecting file
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Send the selected image to the phone
  const handleSendImage = async () => {
    if (!selectedImageBase64) {
      return;
    }
    try {
      await fetch(`${BASE_URL}send-image`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image: selectedImageBase64 }),
      });
      // Clear after sending
      setSelectedImageBase64("");
    } catch (error) {
      console.error("Failed to send image", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Laptop View</h2>
      <button onClick={handleLogout}>Logout</button>

      <div style={{ marginTop: 20 }}>
        <label>Select Image to Send: </label>
        <input type="file" accept="image/*" onChange={handleImageSelect} />
        {selectedImageBase64 && (
          <div style={{ marginTop: 10 }}>
            <button onClick={handleSendImage}>Send Image</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Incoming Text Messages from Phone:</h3>
        {textMessages.map((msg, idx) => (
          <div key={idx} style={{ margin: "5px 0" }}>
            <b>Phone:</b> {msg}
          </div>
        ))}
      </div>
    </div>
  );
}