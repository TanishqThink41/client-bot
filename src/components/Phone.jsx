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

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // Connect to SSE for receiving images from laptop
    const eventSource = new EventSource(`${BASE_URL}sse/phone`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data || "{}");
      if (data.type === "image") {
        // Store only the last 5 images
        setIncomingImages((prev) => {
          const updated = [...prev, data.data];
          if (updated.length > 5) {
            updated.shift(); // remove the oldest
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
  }, [BASE_URL]);

  // POST text to the server as JSON in the request body
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
            updated.shift(); // remove the oldest
          }
          return updated;
        });
        setText("");
      }
    } catch (error) {
      console.error("Failed to send text:", error);
    }
  };

  // Logout route (via POST), then redirect to home if desired
  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-400">
      {/* Header */}
      <div className="flex-none flex items-center p-4 bg-gray-900 text-green-300 shadow-md border-b border-green-500">
        <h2 className="text-xl font-semibold flex-1">Helper Bot</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-950 border-t border-green-500">
        {/* Images from laptop */}
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">Images Received</h3>
          <div className="grid grid-cols-3 gap-3">
            {incomingImages.map((imgB64, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition border border-green-500"
                onClick={() => setSelectedImage(imgB64)}
              >
                <img
                  src={imgB64}
                  alt="from-laptop"
                  className="object-cover rounded-lg w-full h-24"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sent text section */}
        <div>
          <h3 className="text-lg font-semibold text-green-400">Sent Messages</h3>
          <div className="space-y-2">
            {sentTexts.map((msg, idx) => (
              <div key={idx} className="flex justify-end">
              <div
                className={`p-3 rounded-lg shadow max-w-xs border ${msg.startsWith("Code:") ? "bg-gray-800 border-green-500 text-white" : "bg-gray-800 border-gray-500 text-white"}`}
              >
                <p className="break-words">
                  {msg.startsWith("Code:") ? (
                    <>
                      <span className="text-green-400 font-bold">Code:</span>{" "}
                      {msg.substring(5)}
                    </>
                  ) : (
                    msg
                  )}
                </p>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-3 bg-gray-900 border-t border-green-500 flex items-center">
        <textarea
          className="flex-1 min-h-20 bg-gray-800 border border-green-500 rounded-lg px-3 py-2 text-sm text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSendText();
              e.preventDefault();
            }
          }}
        />
        <button
          onClick={handleSendText}
          className="ml-3 bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm shadow-md transition"
        >
          Send
        </button>
      </div>

      {/* Modal for large image preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="text-green-300 text-4xl font-bold absolute top-2 right-3 cursor-pointer"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Enlarged"
              className="object-contain w-[90vw] h-[90vh] rounded-lg shadow-lg border border-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}