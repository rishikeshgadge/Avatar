import React from 'react';
import type { ServerHealth } from '../types';

interface HeaderProps {
  serverHealth: ServerHealth | null;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ serverHealth, onOpenSettings }) => {
  const isAIConnected = serverHealth?.aiConnected || serverHealth?.azureFoundryConnected;
  const isSpeechConnected = serverHealth?.azureSpeechConnected;

  return (
    <header className="h-14 px-5 lg:px-8 flex items-center justify-between z-40 relative flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-xl animate-spin-slow opacity-70"
            style={{ background: 'conic-gradient(from 0deg, #4f9cf9, #a78bfa, #2dd4bf, #4f9cf9)' }}
          />
          <div className="absolute inset-[2px] rounded-[9px] flex items-center justify-center"
            style={{ background: '#080d1a' }}>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" fill="#4f9cf9" />
              <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="#4f9cf9" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="0.75" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide" style={{ color: '#f0f4ff', fontFamily: 'Space Grotesk, sans-serif' }}>
              ARIA
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(79,156,249,0.1)',
                border: '1px solid rgba(79,156,249,0.25)',
                color: '#4f9cf9',
              }}
            >
              AI Assistant
            </span>
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: '#4a5568' }}>
            Advanced Real-time Intelligence
          </p>
        </div>
      </div>

      {/* Right: Status + Settings */}
      <div className="flex items-center gap-3">
        {/* Status indicators */}
        <div className="hidden sm:flex items-center gap-2">
          <StatusPill
            active={!!isAIConnected}
            activeLabel="AI Connected"
            inactiveLabel="Simulation"
            activeColor="#2dd4bf"
            inactiveColor="#64748b"
          />
          <StatusPill
            active={!!isSpeechConnected}
            activeLabel="Speech Active"
            inactiveLabel="Browser TTS"
            activeColor="#4f9cf9"
            inactiveColor="#64748b"
          />
        </div>

        {/* Server status dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: serverHealth?.status === 'healthy' ? '#2dd4bf' : '#f87171',
            boxShadow: serverHealth?.status === 'healthy'
              ? '0 0 8px rgba(45,212,191,0.7)'
              : '0 0 8px rgba(248,113,113,0.7)',
          }}
          title={`Server: ${serverHealth?.status || 'connecting'}`}
        />

        {/* Settings button */}
        <button
          id="settings-btn"
          onClick={onOpenSettings}
          className="btn-ghost !px-3 !py-2"
          title="Settings & Configuration"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

interface StatusPillProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  activeColor: string;
  inactiveColor: string;
}

const StatusPill: React.FC<StatusPillProps> = ({
  active, activeLabel, inactiveLabel, activeColor, inactiveColor,
}) => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-500"
    style={{
      background: active ? `${activeColor}12` : 'rgba(100,116,139,0.08)',
      border: `1px solid ${active ? activeColor + '35' : 'rgba(100,116,139,0.2)'}`,
      color: active ? activeColor : inactiveColor,
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{
        background: active ? activeColor : inactiveColor,
        boxShadow: active ? `0 0 5px ${activeColor}` : 'none',
      }}
    />
    {active ? activeLabel : inactiveLabel}
  </div>
);
