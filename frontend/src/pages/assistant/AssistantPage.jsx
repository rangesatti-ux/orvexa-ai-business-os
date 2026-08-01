import { useState } from "react";
import { Bot, Send } from "lucide-react";

function AssistantPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "AI",
      text: "👋 Hello! I'm your Orvexa AI Assistant. How can I help you today?",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "You",
      text: message,
    };

    const aiMessage = {
      sender: "AI",
      text: "This is a demo response. Later this will connect to your FastAPI backend.",
    };

    setChat([...chat, userMessage, aiMessage]);
    setMessage("");
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">

        <div className="flex items-center gap-2 mb-6">
          <Bot className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Orvexa AI Assistant</h1>
        </div>

        <div className="border rounded-lg h-96 overflow-y-auto p-4 bg-gray-50">
          {chat.map((item, index) => (
            <div key={index} className="mb-4">
              <strong>{item.sender}: </strong>
              {item.text}
            </div>
          ))}
        </div>

        <div className="flex mt-4 gap-3">
          <input
            type="text"
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Ask anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default AssistantPage;