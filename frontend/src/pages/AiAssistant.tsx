import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Clock,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Receipt,
  Boxes,
  FileText,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  mode?: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am **BuildNex AI**, your construction project management copilot.

I have direct access to your real-time site field logs, material warehouse buffers, subcontractor invoices, capital drawdowns, and customer unit reservations.

How can I assist your operations today? You can choose a suggested prompt below or type your inquiry.`,
      time: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useApp();

  const suggestedPrompts = [
    'What is our total budget vs actual expenses?',
    'Which materials are currently in low stock?',
    'Summarize progress for Skyline Heights Luxury Towers',
    'Draft an executive project report',
    'What are the urgent tasks due this week?',
    'Give me a safety and inspection update',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (messageText: string = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.askAi(textToSend, history);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: res.mode,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      showToast('Assistant temporarily unavailable', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'm-reset',
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you with your construction projects?',
        time: 'Just now',
      },
    ]);
  };

  // Helper to format basic markdown-like lines
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 text-base mt-2 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const clean = line.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-brand-600 font-bold shrink-0">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(clean) }} />
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-brand-600 font-semibold shrink-0">
                  {line.match(/^\d+\./)?.[0]}
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatBold(line.replace(/^\d+\.\s/, '')),
                  }}
                />
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatBold(line) }}
            />
          );
        })}
      </div>
    );
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200/90 shadow-sm shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900">BuildNex AI Copilot</h1>
              <Badge variant="primary" size="sm">
                Construction LLM
              </Badge>
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Live Context
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Domain-aware intelligence analyzing live project milestones, expenses, and materials
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Reset Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset History</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-brand-600 text-white shadow-brand-500/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-3xl rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50/90 text-slate-800 border border-slate-200/90 rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' ? (
                renderMessageContent(msg.text)
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}

              <div
                className={`flex items-center justify-between pt-2.5 mt-2.5 border-t ${
                  msg.sender === 'user'
                    ? 'border-slate-800 text-slate-400'
                    : 'border-slate-200/70 text-slate-400'
                } text-[10px] font-medium`}
              >
                <span>{msg.time}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="hover:text-slate-800 flex items-center space-x-1 transition-colors"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-medium ml-1">Analyzing construction telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Suggested:
        </span>
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium px-3.5 py-1.5 rounded-full border border-slate-200 whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about project milestones, budgets, material stocks, or reports..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 placeholder-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
