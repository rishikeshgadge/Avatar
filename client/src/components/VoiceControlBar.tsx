import React from 'react';
import type { AvatarState } from '../types';

interface VoiceControlBarProps {
  avatarState: AvatarState;
  sessionActive: boolean;
  micMuted: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onToggleMic: () => void;
}

const STATE_INFO: Record<AvatarState, { label: string; color: string }> = {
  idle:      { label: 'Ready', color: '#4f9cf9' },
  listening: { label: 'Listening', color: '#2dd4bf' },
  thinking:  { label: 'Thinking', color: '#a78bfa' },
  speaking:  { label: 'Speaking', color: '#60a5fa' },
  stopped:   { label: 'Stopped', color: '#64748b' },
  error:     { label: 'Error', color: '#f87171' },
};

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({
  avatarState,
  sessionActive,
  micMuted,
  onStartSession,
  onStopSession,
  onToggleMic,
}) => {
  const stateInfo = STATE_INFO[avatarState];

  return (
    <footer
      className="h-20 px-6 lg:px-10 flex items-center justify-between z-30 relative flex-shrink-0"
      style={{
        background: 'rgba(5,8,16,0.9)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Left: Avatar State */}
      <div className="flex items-center gap-3 min-w-[120px]">
        {/* Animated state indicator */}
        <div className="relative flex-shrink-0">
          {/* Outer pulse ring */}
          {avatarState !== 'idle' && avatarState !== 'stopped' && (
            <div
              className="absolute -inset-1.5 rounded-full opacity-30"
              style={{
                background: stateInfo.color,
                animation: 'ring-pulse 2s ease-in-out infinite',
              }}
            />
          )}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center relative"
            style={{
              background: `${stateInfo.color}15`,
              border: `1px solid ${stateInfo.color}40`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: stateInfo.color,
                boxShadow: `0 0 8px ${stateInfo.color}`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold" style={{ color: stateInfo.color }}>
            {stateInfo.label}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#2d3748' }}>
            {!sessionActive ? 'Session ended' : micMuted ? 'Mic muted' : 'Session active'}
          </div>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center gap-3">
        {/* Start button */}
        <button
          id="start-session-btn"
          onClick={onStartSession}
          disabled={sessionActive && !micMuted}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200"
          style={sessionActive && !micMuted
            ? {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#2d3748',
              cursor: 'not-allowed',
            }
            : {
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              boxShadow: '0 4px 20px -4px rgba(5,150,105,0.5)',
              color: 'white',
              border: '1px solid rgba(5,150,105,0.4)',
            }
          }
          onMouseEnter={(e) => {
            if (sessionActive && !micMuted) return;
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px -4px rgba(5,150,105,0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = sessionActive && !micMuted ? 'none' : '0 4px 20px -4px rgba(5,150,105,0.5)';
          }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start
        </button>

        {/* Mic toggle (center, larger) */}
        <button
          id="mic-toggle-btn"
          onClick={onToggleMic}
          disabled={!sessionActive}
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
          style={!sessionActive
            ? {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              cursor: 'not-allowed',
            }
            : micMuted
            ? {
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.15) 100%)',
              border: '1px solid rgba(239,68,68,0.35)',
              boxShadow: '0 4px 16px -4px rgba(239,68,68,0.3)',
            }
            : {
              background: 'linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(6,182,212,0.1) 100%)',
              border: '1px solid rgba(45,212,191,0.35)',
              boxShadow: '0 4px 16px -4px rgba(45,212,191,0.3)',
            }
          }
          onMouseEnter={(e) => {
            if (!sessionActive) return;
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
          title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {micMuted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}

          {/* Listening pulse ring */}
          {sessionActive && !micMuted && avatarState === 'listening' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(45,212,191,0.4)',
                animation: 'ring-pulse 1.5s ease-in-out infinite',
              }}
            />
          )}
        </button>

        {/* Stop button */}
        <button
          id="stop-session-btn"
          onClick={onStopSession}
          disabled={!sessionActive}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200"
          style={!sessionActive
            ? {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#2d3748',
              cursor: 'not-allowed',
            }
            : {
              background: 'linear-gradient(135deg, #dc2626 0%, #be185d 100%)',
              boxShadow: '0 4px 20px -4px rgba(220,38,38,0.4)',
              color: 'white',
              border: '1px solid rgba(220,38,38,0.4)',
            }
          }
          onMouseEnter={(e) => {
            if (!sessionActive) return;
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          Stop
        </button>
      </div>

      {/* Right: Branding */}
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-semibold" style={{ color: '#2d3748', fontFamily: 'Space Grotesk, sans-serif' }}>
            ARIA
          </div>
          <div className="text-[10px]" style={{ color: '#1a2535' }}>
            v2.0
          </div>
        </div>
      </div>
    </footer>
  );
};
