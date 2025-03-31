import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function PhoneView() {
  const [incomingImages, setIncomingImages] = useState([]);
  const [sentTexts, setSentTexts] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(""); // State for error message
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}sse/phone`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data || "{}");
      if (data.type === "image") {
        setIncomingImages((prev) => {
          const updated = [...prev, data.data];
          if (updated.length > 5) updated.shift();
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

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setSendError("");
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
          if (updated.length > 5) updated.shift();
          return updated;
        });
        setText("");
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send text:", error);
      setSendError("An error occurred while sending the message.");
      
      // Automatically clear error after 3 seconds
      setTimeout(() => setSendError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-400 p-2 sm:p-4">
      <div className="flex items-center p-3 bg-gray-900 text-green-300 shadow-md border-b border-green-500">
        <h2 className="text-lg sm:text-xl font-semibold flex-1">Helper Bot</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-950 border-t border-green-500">
        <h3 className="text-md sm:text-lg font-semibold text-green-400">
          Images Received
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {incomingImages.map((imgB64, idx) => (
            <img
              key={idx}
              src={imgB64}
              alt="from-laptop"
              className="object-cover rounded-lg w-full h-20 sm:h-24 border border-green-500 cursor-pointer"
              onClick={() => setSelectedImage(imgB64)}
            />
          ))}
        </div>

        <h3 className="text-md sm:text-lg font-semibold text-green-400">
          Sent Messages
        </h3>
        <div className="space-y-2">
          {sentTexts.map((msg, idx) => (
            <div key={idx} className="flex justify-end">
              <div className="p-2 sm:p-3 rounded-lg shadow max-w-xs bg-gray-800 border border-green-500 text-white">
                <p className="break-words">{msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none p-2 sm:p-3 bg-gray-900 border-t border-green-500 flex flex-col">
        <div className="flex items-center">
          <textarea
            className="flex-1 min-h-[80px] max-h-[40vh] md:min-h-[120px] bg-gray-800 border border-green-500 rounded-lg px-2 py-1 text-sm text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendText();
                e.preventDefault();
              }
            }}
          />

          <button
            onClick={handleSendText}
            className="ml-2 sm:ml-3 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center justify-center min-w-[70px] sm:min-w-[80px]"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Send"}
          </button>
        </div>

        {sendError && (
          <p className="mt-2 text-red-500 text-sm text-center">{sendError}</p>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged"
            className="object-contain max-w-full max-h-full border border-green-500 rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}