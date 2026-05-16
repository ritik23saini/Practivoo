"use client";

import { IoChevronBackSharp } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify"; 

interface Message {
  content: string;
  sender: "self" | "user";
  createdAt: string;
}

interface MessageBoxProps {
  onBack: () => void;
  user: any;
}

const MessageBox: React.FC<MessageBoxProps> = ({ onBack, user }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (!user?._id) return;

  setMessages([]); // Clear old messages instantly
  setLoading(true);
  fetchMessages().finally(() => setLoading(false));
}, [user._id]);

  useEffect(() => {
    // Scroll to latest message when messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${user._id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage: Message = {
    content: input.trim(),
    sender: "self",
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, newMessage]);
  setInput("");

  try {
    await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "64ab00000000000000000001", // currentUserId
        to: user._id,
        content: newMessage.content,
      }),
    });

    // ✅ Show toast on success
    toast.success("Message sent!");
  } catch (err) {
    console.error("Message send error:", err);
    toast.error("Failed to send message.");
  }
};

  const groupMessagesByDate = () => {
    const grouped: { [date: string]: Message[] } = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="bg-white w-full max-w-sm h-full p-4 rounded-2xl shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-4">
        <button onClick={onBack} className="absolute left-0 text-xl text-black" aria-label="Go back">
          <IoChevronBackSharp />
        </button>
        <h2 className="text-lg font-bold text-black">{user.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading messages...</p>
        ) : Object.entries(groupedMessages).map(([date, msgs], idx) => (
          <div key={idx}>
            <p className="text-xs text-center text-gray-500 mb-2">{date}</p>
            {msgs.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.sender === "self" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block px-4 py-2 text-sm rounded-xl max-w-[80%] ${
                    msg.sender === "self"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-[#EDF1FF] text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 pr-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="mt-4">
        <div className="bg-black rounded-full flex items-center px-4 py-2">
          <input
            type="text"
            placeholder="Type here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-white placeholder:text-gray-400 text-sm outline-none"
          />
          <button onClick={handleSend} className="text-white text-lg" aria-label="Send message">
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;