import React from 'react';
import type { AvatarState } from '../types';
import { Play, Square, Mic, MicOff } from 'lucide-react';
import { StateBadge } from './StateBadge';

interface VoiceControlBarProps {
  avatarState: AvatarState;
  sessionActive: boolean;
  micMuted: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onToggleMic: () => void;
}

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({
  avatarState,
  sessionActive,
  micMuted,
  onStartSession,
  onStopSession,
  onToggleMic,
}) => {
  return (
    <footer className="h-20 px-8 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between z-30 relative shadow-2xl">
      {/* Left side: Sleek Brand/Status Indicator */}
      <div className="flex items-center gap-3">
        <StateBadge state={avatarState} micMuted={micMuted} />
      </div>

      {/* Center Controls: Start, Stop, Mic buttons */}
      <div className="flex items-center gap-4">
        {/* Start Button */}
        <button
          onClick={onStartSession}
          disabled={sessionActive && !micMuted}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
            sessionActive && !micMuted
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-400/30 shadow-emerald-950/50 scale-105'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={onStopSession}
          disabled={!sessionActive}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
            !sessionActive
              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-red-500/30 shadow-red-950/50'
          }`}
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Stop</span>
        </button>

        {/* Microphone Mute/Unmute Button */}
        <button
          onClick={onToggleMic}
          className={`p-2.5 rounded-xl border font-medium text-xs transition-all shadow-md ${
            micMuted
              ? 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900/60'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
          }`}
          title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {micMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Right side: Clean minimal placeholder spacing */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Azure AI Assistant</span>
      </div>
    </footer>
  );
};
