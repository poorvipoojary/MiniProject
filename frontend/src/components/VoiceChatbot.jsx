import { useState, useRef, useEffect } from "react";

const VoiceChatbot = ({ onClose }) => {
  const [reply, setReply] = useState("");
  const [input, setInput] = useState("");
  const recognitionRef = useRef(null);

  // Stop speech + mic when closing
  const handleClose = () => {
    // Stop speaking
    window.speechSynthesis.cancel();

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    onClose();
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;

        setReply((prev) => prev + `\nYou: ${transcript}`);

        const res = await fetch("http://localhost:5000/api/ai/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: transcript }),
        });

        const data = await res.json();

        setReply((prev) => prev + `\n\nBot: ${data.reply}`);

        const utter = new SpeechSynthesisUtterance(data.reply);
        window.speechSynthesis.speak(utter);
      };
    }

    recognitionRef.current.start();
  };

  // SEND TYPED MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    setReply((prev) => prev + `\nYou: ${input}`);

    const res = await fetch("http://localhost:5000/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setReply((prev) => prev + `\n\nBot: ${data.reply}`);

    const utter = new SpeechSynthesisUtterance(data.reply);
    window.speechSynthesis.speak(utter);

    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white shadow-xl p-6 rounded-xl w-[420px] h-[500px]">
        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
        >
          ❌
        </button>

        <h3 className="font-bold text-xl mb-3 text-center">🎤 Voice Chatbot</h3>

        {/* MESSAGE BOX */}
        <div className="bg-gray-100 p-3 rounded-md h-64 overflow-y-auto whitespace-pre-line text-sm">
          {reply || "Tap the mic or type a message..."}
        </div>

        {/* TYPING BOX */}
        <input
          type="text"
          placeholder="Type your message..."
          className="mt-3 w-full p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={startListening}
            className="flex-1 bg-blue-600 text-white p-2 rounded"
          >
            🎙 Start Speaking
          </button>

          <button
            onClick={sendMessage}
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            📩 Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatbot;
