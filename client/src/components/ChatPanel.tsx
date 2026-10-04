import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage, LanguageCode } from '../types';
import { Send, Trash2, Bot, User, Sparkles, ExternalLink } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  interimTranscript: string;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  currentLanguage: LanguageCode;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  interimTranscript,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-azure-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Conversation History
          </h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.length === 0 && !interimTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-azure-900/20 border border-azure-500/20 flex items-center justify-center mb-3 text-azure-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-200 mb-1">
              Start Conversation
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Click <strong className="text-slate-200">Start</strong> at the bottom to speak directly with the AI Avatar, or pick a suggested query below.
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Suggested Prompts
              </p>
              {[
                'What are your enterprise AI capabilities?',
                'Tell me about your Azure AI Search integration',
                'नमस्ते, आप कैसे सहायता कर सकते हैं?',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-xs text-slate-300 transition-all duration-200 hover:border-azure-500/40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-azure-600/20 border border-azure-500/30 flex items-center justify-center flex-shrink-0 text-azure-400 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-azure-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 gap-2">
                <span className="font-semibold text-slate-300">
                  {msg.sender === 'user' ? 'You' : 'Foundry Agent'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="prose prose-invert prose-xs leading-relaxed max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Citations if available from Azure AI Search */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Sources:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-azure-300 border border-slate-700"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        {c.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Interim STT Live Transcript Preview */}
        {interimTranscript && (
          <div className="flex gap-3 justify-end opacity-80 animate-pulse">
            <div className="max-w-[85%] rounded-2xl p-3 bg-azure-900/40 text-azure-200 border border-azure-500/30 italic text-xs">
              <span className="text-[10px] uppercase font-semibold text-azure-400 block mb-0.5">
                Listening...
              </span>
              "{interimTranscript}"
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-11 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-azure-500/60 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-1.5 p-1.5 rounded-lg bg-azure-600 text-white disabled:opacity-30 disabled:bg-slate-800 transition-all hover:bg-azure-500"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
