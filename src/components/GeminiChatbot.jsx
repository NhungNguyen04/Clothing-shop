import React, { useState, useRef } from "react";
import { getGeminiSuggestion } from "../api/gemini";
import axiosInstance from "../api/axiosInstance";

const GeminiChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi có thể gợi ý sản phẩm cho bạn. Hãy hỏi tôi bất cứ điều gì về thời trang!" }
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  async function fetchProducts() {
    try {
      const res = await axiosInstance.get("/products");
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data.slice(0, 12);
      }
      return [];
    } catch {
      return [];
    }
  }

  function isGreeting(text) {
    const greetings = ["chào", "hello", "hi", "xin chào", "good morning", "good afternoon", "good evening", "greetings", "how are you", "khỏe không", "dạo này thế nào", "nice to meet you"];
    return greetings.some(g => text.toLowerCase().includes(g));
  }

  function renderMessageText(text) {
    const imgRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp))/gi;
    const parts = text.split(imgRegex);
    return parts.map((part, idx) => {
      if (imgRegex.test(part)) {
        return (
          <img
            key={idx}
            src={part}
            alt="Sản phẩm"
            style={{ maxWidth: 120, maxHeight: 120, margin: 4, borderRadius: 8, display: 'inline-block' }}
          />
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }

  function buildPrompt(userInput, products) {
    if (isGreeting(userInput)) {
      return `Bạn là trợ lý tư vấn sản phẩm thời trang cho shop. Nếu người dùng chỉ chào hỏi hoặc nói chuyện xã giao, hãy trả lời thân thiện, giới thiệu bạn có thể gợi ý sản phẩm khi họ cần. Không cần gợi ý sản phẩm nếu họ chưa hỏi.`;
    }
    // Nếu user hỏi về hình ảnh
    const lowerInput = userInput.toLowerCase();
    if (
      lowerInput.includes("hình ảnh") ||
      lowerInput.includes("xem ảnh") ||
      lowerInput.includes("minh họa") ||
      lowerInput.includes("xem sản phẩm") ||
      lowerInput.includes("có ảnh không")
    ) {
      const productList = products.slice(0, 3).map(
        (p, i) => `${i + 1}. ${p.name}\n${p.image?.[0] || ""}`
      ).join("\n\n");
      return `Người dùng muốn xem hình ảnh sản phẩm. Hãy trả lời thật tự nhiên, chỉ liệt kê số thứ tự và tên sản phẩm, phía dưới là hình ảnh (link ảnh). Không cần giải thích, không lặp lại yêu cầu. Dưới đây là 3 sản phẩm đầu tiên:\n${productList}`;
    }
    // Mặc định cho các yêu cầu khác
    const productList = products.map(
      (p, i) => `${i+1}. ${p.name} - ${p.description} - giá ${p.price} - size: ${p.stockSize?.map(s => s.size).join(", ")} - loại: ${p.category} - link ảnh: ${p.image?.[0] || ''}`
    ).join("\n");
    return `Dưới đây là danh sách sản phẩm của shop:\n${productList}\nHãy gợi ý sản phẩm phù hợp với yêu cầu: \"${userInput}\". Chỉ trả lời ngắn gọn tối đa 3-4 câu, không giải thích dài dòng, nếu có nhiều sản phẩm phù hợp hãy liệt kê tối đa 3 sản phẩm và kèm link ảnh.`;
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const products = await fetchProducts();
      console.log("[GeminiChatbot DEBUG] Products for Gemini prompt:", products);
      if (!products || products.length === 0) {
        console.warn("[GeminiChatbot DEBUG] Không lấy được sản phẩm từ API /products hoặc danh sách rỗng!");
      }
      const prompt = buildPrompt(input, products);
      console.log("[GeminiChatbot DEBUG] Prompt gửi lên Gemini:", prompt);
      const reply = await getGeminiSuggestion(prompt);
      setMessages(msgs => [...msgs, { from: "bot", text: reply }]);
    } catch (err) {
      console.error("[GeminiChatbot DEBUG] Gemini error:", err);
      setMessages(msgs => [...msgs, { from: "bot", text: "Xin lỗi, tôi không trả lời được lúc này." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 p-3 rounded-full shadow-lg hover:bg-green-700 transition"
          title="Chat với Gemini"
        >
          <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.39 1.05 4.55 2.82 6.22L4 22l4.97-1.32C10.62 20.9 11.3 21 12 21c5.52 0 10-4.03 10-9s-4.48-9-10-9zm0 16c-.62 0-1.23-.07-1.82-.2l-.39-.09-2.96.79.79-2.89-.26-.27C5.09 14.13 4 12.65 4 11c0-3.86 3.58-7 8-7s8 3.14 8 7-3.58 7-8 7z"/></svg>
        </button>
      )}
      {open && (
        <div className="w-80 bg-white rounded-lg shadow-2xl flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-bold text-green-700">Trợ lý gợi ý sản phẩm</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500 text-xl">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 300 }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.from === "bot" ? "text-left" : "text-right"}>
                <span className={msg.from === "bot" ? "bg-green-100 text-green-800 px-3 py-2 rounded-lg inline-block" : "bg-gray-200 text-gray-800 px-3 py-2 rounded-lg inline-block"}>
                  {renderMessageText(msg.text)}
                </span>
              </div>
            ))}
            {loading && <div className="text-green-600">Trợ lý đang trả lời...</div>}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-green-600"
              placeholder="Bạn muốn gợi ý gì?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
              disabled={loading || !input.trim()}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChatbot; 