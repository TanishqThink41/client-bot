import React, { useEffect, useState } from "react";

export default function PhoneView() {
  // Keep track of the last 5 incoming images
  const [incomingImages, setIncomingImages] = useState([]);
  // Keep track of the last 5 texts sent by phone
  const [sentTexts, setSentTexts] = useState([]);
  // For the input box where user types text
  const [text, setText] = useState("");
  // Selected image for modal
  const [selectedImage, setSelectedImage] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    // Connect to SSE for receiving images from laptop
    const eventSource = new EventSource(`${BASE_URL}sse/phone`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "image") {
        // Store only the last 5 images
        setIncomingImages((prev) => {
          const updated = [...prev, data.data];
          if (updated.length > 5) {
            updated.shift(); // remove oldest
          }
          return updated;
        });
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error (phone):", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`${BASE_URL}send-text`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setSentTexts((prev) => {
          const updated = [...prev, trimmed];
          if (updated.length > 5) {
            updated.shift(); // remove oldest
          }
          return updated;
        });
        setText("");
      }
    } catch (error) {
      console.error("Failed to send text", error);
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex-none flex items-center p-4 bg-green-600 text-white">
        <h2 className="text-xl font-bold flex-1">WhatsApp-like Phone View</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Images from laptop */}
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          Images from Laptop (last 5)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {incomingImages.map((imgB64, idx) => (
            <div
              key={idx}
              className="bg-white p-2 rounded-md shadow-sm cursor-pointer"
              onClick={() => setSelectedImage(imgB64)}
            >
              <img
                src={imgB64}
                alt="from-laptop"
                className="object-cover rounded-md w-full h-24"
              />
            </div>
          ))}
        </div>

        {/* Sent text section */}
        <h3 className="text-md font-semibold text-gray-700 mt-6 mb-2">
          My Sent Texts (last 5)
        </h3>
        {sentTexts.map((msg, idx) => (
          <div key={idx} className="my-2 flex justify-end">
            <div className="bg-green-200 p-2 rounded-md shadow-sm max-w-xs">
              <p className="text-gray-800 break-words">{msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex-none p-3 bg-white border-t border-gray-300 flex items-center">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendText();
          }}
        />
        <button
          onClick={handleSendText}
          className="ml-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Send
        </button>
      </div>

      {/* Modal for large image preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setSelectedImage(null)} // click outside to close
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // prevent closing if clicking on image container
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="text-white self-end text-2xl font-bold mb-2 mr-2 absolute top-0 right-0"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Enlarged"
              className="object-contain w-[90vw] h-[90vh] rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}