import React from 'react';
import type { AvatarState } from '../types';
import { Volume2, Mic, Brain, Square, AlertCircle, Circle } from 'lucide-react';

interface StateBadgeProps {
  state: AvatarState;
  micMuted?: boolean;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state, micMuted }) => {
  if (micMuted && state === 'idle') {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
        Microphone Off
      </div>
    );
  }

  const stateConfigs: Record<
    AvatarState,
    { label: string; bg: string; border: string; text: string; dot: string; icon: React.ReactNode }
  > = {
    idle: {
      label: 'Idle',
      bg: 'bg-slate-800/60',
      border: 'border-slate-700/60',
      text: 'text-slate-300',
      dot: 'bg-slate-400',
      icon: <Circle className="w-3 h-3 text-slate-400" />,
    },
    listening: {
      label: 'Listening',
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400 animate-ping',
      icon: <Mic className="w-3.5 h-3.5 text-emerald-400" />,
    },
    thinking: {
      label: 'Thinking',
      bg: 'bg-purple-950/60',
      border: 'border-purple-500/40',
      text: 'text-purple-300',
      dot: 'bg-purple-400 animate-pulse',
      icon: <Brain className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
    },
    speaking: {
      label: 'Speaking',
      bg: 'bg-sky-950/60',
      border: 'border-sky-500/40',
      text: 'text-sky-300',
      dot: 'bg-sky-400 animate-bounce',
      icon: <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />,
    },
    stopped: {
      label: 'Stopped',
      bg: 'bg-slate-900/80',
      border: 'border-slate-700/80',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      icon: <Square className="w-3 h-3 text-slate-400" />,
    },
    error: {
      label: 'Error',
      bg: 'bg-red-950/60',
      border: 'border-red-500/40',
      text: 'text-red-300',
      dot: 'bg-red-400',
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
    },
  };

  const cfg = stateConfigs[state] || stateConfigs.idle;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-sm transition-all duration-300 ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}></span>
      </span>
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  );
};
