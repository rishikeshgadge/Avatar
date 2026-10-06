import React from 'react';
import type { ServerHealth } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverHealth: ServerHealth | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, serverHealth }) => {
  if (!isOpen) return null;

  const isConnected = serverHealth?.aiConnected || serverHealth?.azureFoundryConnected;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-slide-up"
        style={{
          background: 'rgba(8,13,26,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,156,249,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(79,156,249,0.2) 0%, rgba(167,139,250,0.15) 100%)',
                border: '1px solid rgba(79,156,249,0.25)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#4f9cf9" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>Configuration</h2>
              <p className="text-xs mt-0.5" style={{ color: '#4a5568' }}>API & Diagnostics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.25)';
              (e.currentTarget as HTMLElement).style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.color = '#64748b';
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatusCard
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            }
            label="AI Model"
            value={isConnected ? (serverHealth?.aiModel || 'Connected') : 'Simulation Mode'}
            active={!!isConnected}
            activeColor="#2dd4bf"
          />
          <StatusCard
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            }
            label="Speech"
            value={serverHealth?.azureSpeechConnected ? 'Azure Neural TTS' : 'Browser Speech API'}
            active={!!serverHealth?.azureSpeechConnected}
            activeColor="#4f9cf9"
          />
        </div>

        {/* API Configuration Instructions */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: 'rgba(5,8,16,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#4f9cf9" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#8b9cb8' }}>
              Configure API in <code className="font-mono" style={{ color: '#4f9cf9' }}>server/.env</code>
            </span>
          </div>

          <pre
            className="text-[11px] font-mono rounded-xl p-3 overflow-x-auto leading-relaxed"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: '#64748b',
            }}
          >
            <span style={{ color: '#4a5568' }}># Direct API (Azure OpenAI / OpenAI compatible){'\n'}</span>
            <span style={{ color: '#2dd4bf' }}>AI_API_URL</span>
            <span style={{ color: '#64748b' }}>=https://your-resource.openai.azure.com/openai/deployments/gpt-4o{'\n'}</span>
            <span style={{ color: '#2dd4bf' }}>AI_API_KEY</span>
            <span style={{ color: '#64748b' }}>=your_api_key_here{'\n'}</span>
            <span style={{ color: '#2dd4bf' }}>AI_MODEL_NAME</span>
            <span style={{ color: '#64748b' }}>=gpt-4o{'\n'}</span>
            <span style={{ color: '#2dd4bf' }}>SIMULATION_MODE</span>
            <span style={{ color: '#64748b' }}>=false</span>
          </pre>
        </div>

        {/* Server status */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 text-xs"
          style={{
            background: serverHealth?.status === 'healthy'
              ? 'rgba(45,212,191,0.06)'
              : 'rgba(248,113,113,0.06)',
            border: `1px solid ${serverHealth?.status === 'healthy' ? 'rgba(45,212,191,0.2)' : 'rgba(248,113,113,0.2)'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: serverHealth?.status === 'healthy' ? '#2dd4bf' : '#f87171',
                boxShadow: serverHealth?.status === 'healthy' ? '0 0 6px #2dd4bf' : '0 0 6px #f87171',
              }}
            />
            <span style={{ color: '#8b9cb8' }}>
              Server: <strong style={{ color: serverHealth?.status === 'healthy' ? '#2dd4bf' : '#f87171' }}>
                {serverHealth?.status || 'Connecting...'}
              </strong>
            </span>
          </div>
          <span style={{ color: '#2d3748' }}>
            {serverHealth?.simulationMode ? 'Simulation Mode' : 'Live Mode'}
          </span>
        </div>

        {/* Footer button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #4f9cf9 0%, #6366f1 100%)',
              color: 'white',
              boxShadow: '0 4px 16px -4px rgba(79,156,249,0.4)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  activeColor: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, value, active, activeColor }) => (
  <div
    className="p-3.5 rounded-2xl"
    style={{
      background: active ? `${activeColor}08` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? activeColor + '25' : 'rgba(255,255,255,0.06)'}`,
    }}
  >
    <div className="flex items-center gap-2 mb-1.5" style={{ color: active ? activeColor : '#4a5568' }}>
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
    <p className="text-[11px] ml-6" style={{ color: active ? '#8b9cb8' : '#2d3748' }}>
      {value}
    </p>
  </div>
);
