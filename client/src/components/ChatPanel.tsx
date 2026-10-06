import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage, LanguageCode } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  interimTranscript: string;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  currentLanguage: LanguageCode;
  isProcessing?: boolean;
}

const SUGGESTED_PROMPTS = [
  { icon: '👋', text: 'Hello, introduce yourself', label: 'Greet ARIA' },
  { icon: '🧠', text: 'What can you help me with?', label: 'Capabilities' },
  { icon: '🚀', text: 'Tell me something interesting', label: 'Surprise me' },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  interimTranscript,
  onSendMessage,
  onClearChat,
  isProcessing = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isEmpty = messages.length === 0 && !interimTranscript;

  return (
    <div
      className="h-full flex flex-col rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(8,13,26,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.6)',
      }}
    >
      {/* Panel Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(79,156,249,0.12)', border: '1px solid rgba(79,156,249,0.2)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#4f9cf9" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>Conversation</h2>
            {messages.length > 0 && (
              <p className="text-[10px] mt-0.5" style={{ color: '#4a5568' }}>
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {messages.length > 0 && (
          <button
            id="clear-chat-btn"
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
            style={{
              color: '#64748b',
              background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#f87171';
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#64748b';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            }}
            title="Clear chat"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontSize: '13px' }}>
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-slide-up">
            {/* Empty state icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(79,156,249,0.15) 0%, rgba(167,139,250,0.1) 100%)',
                border: '1px solid rgba(79,156,249,0.2)',
              }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(79,156,249,0.3)" />
                <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 3-2.5 3M12 17h.01" stroke="#4f9cf9" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#e2e8f0' }}>
              Start talking with ARIA
            </h3>
            <p className="text-xs mb-6 max-w-xs leading-relaxed" style={{ color: '#4a5568' }}>
              Press <strong style={{ color: '#8b9cb8' }}>Start</strong> to speak, or type a message below
            </p>

            {/* Suggested prompts */}
            <div className="w-full space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#2d3748' }}>
                Try asking
              </p>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt.text)}
                  className="w-full text-left p-3 rounded-xl transition-all duration-200 group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(79,156,249,0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,156,249,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{prompt.icon}</span>
                    <div>
                      <div className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                        {prompt.label}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#4a5568' }}>
                        "{prompt.text}"
                      </div>
                    </div>
                    <svg className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="#4f9cf9" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-slide-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${idx * 0.02}s` }}
          >
            {/* Assistant avatar */}
            {msg.sender === 'assistant' && (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,156,249,0.2) 0%, rgba(167,139,250,0.15) 100%)',
                  border: '1px solid rgba(79,156,249,0.25)',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3" fill="#4f9cf9" />
                  <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}

            <div className={`max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {/* Sender name + time */}
              <div className={`flex items-center gap-2 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] font-semibold" style={{ color: msg.sender === 'user' ? '#60a5fa' : '#a78bfa' }}>
                  {msg.sender === 'user' ? 'You' : 'ARIA'}
                </span>
                <span className="text-[10px]" style={{ color: '#2d3748' }}>{msg.timestamp}</span>
              </div>

              {/* Bubble */}
              <div
                className="rounded-2xl px-4 py-3 leading-relaxed"
                style={msg.sender === 'user'
                  ? {
                    background: 'linear-gradient(135deg, rgba(79,156,249,0.18) 0%, rgba(99,102,241,0.12) 100%)',
                    border: '1px solid rgba(79,156,249,0.22)',
                    borderBottomRightRadius: '6px',
                    color: '#e2e8f0',
                  }
                  : {
                    background: 'rgba(13,21,38,0.9)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderBottomLeftRadius: '6px',
                    color: '#cbd5e1',
                  }
                }
              >
                <div className="prose prose-invert prose-xs max-w-none text-inherit">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {msg.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-colors"
                        style={{
                          background: 'rgba(79,156,249,0.1)',
                          border: '1px solid rgba(79,156,249,0.2)',
                          color: '#60a5fa',
                        }}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {c.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User avatar */}
            {msg.sender === 'user' && (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: 'rgba(96,165,250,0.12)',
                  border: '1px solid rgba(96,165,250,0.2)',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && !interimTranscript && (
          <div className="flex gap-2.5 justify-start animate-slide-up">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(99,102,241,0.15) 100%)',
                border: '1px solid rgba(167,139,250,0.25)',
              }}
            >
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{
                background: 'rgba(13,21,38,0.9)',
                border: '1px solid rgba(167,139,250,0.15)',
                borderBottomLeftRadius: '6px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#a78bfa',
                    animation: `wave-bar 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                    '--wave-duration': '0.9s',
                  } as React.CSSProperties}
                />
              ))}
              <span className="text-xs ml-1" style={{ color: '#64748b' }}>ARIA is thinking...</span>
            </div>
          </div>
        )}

        {/* Interim transcript */}
        {interimTranscript && (
          <div className="flex justify-end animate-slide-up">
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3 italic text-xs"
              style={{
                background: 'rgba(45,212,191,0.08)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderBottomRightRadius: '6px',
                color: '#5eead4',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#2dd4bf', boxShadow: '0 0 6px #2dd4bf', animation: 'ring-pulse 1s ease-in-out infinite' }}
                />
                <span className="text-[10px] font-semibold not-italic" style={{ color: '#2dd4bf' }}>Listening...</span>
              </div>
              "{interimTranscript}"
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-200"
          style={{
            background: isFocused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
            border: isFocused ? '1px solid rgba(79,156,249,0.4)' : '1px solid rgba(255,255,255,0.07)',
            boxShadow: isFocused ? '0 0 0 3px rgba(79,156,249,0.08)' : 'none',
          }}
        >
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message or use voice..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: '#e2e8f0', caretColor: '#4f9cf9' }}
            disabled={isProcessing}
          />
          <button
            id="send-message-btn"
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={inputText.trim() && !isProcessing
              ? {
                background: 'linear-gradient(135deg, #4f9cf9, #6366f1)',
                boxShadow: '0 2px 12px rgba(79,156,249,0.4)',
              }
              : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }
            }
          >
            <svg
              className="w-3.5 h-3.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke={inputText.trim() && !isProcessing ? 'white' : '#4a5568'}
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
