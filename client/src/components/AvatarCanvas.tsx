import React, { useEffect, useRef } from 'react';
import type { AvatarState } from '../types';
import { StateBadge } from './StateBadge';
import { Sparkles, Mic, Activity } from 'lucide-react';

interface AvatarCanvasProps {
  state: AvatarState;
  micMuted?: boolean;
  micVolume?: number;
  lipSyncAmplitude?: number;
  azureVideoUrl?: string | null;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  state,
  micMuted = false,
  micVolume = 0,
  lipSyncAmplitude = 0,
  azureVideoUrl = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Aura mapping class for background ambient lighting
  const auraClasses: Record<AvatarState, string> = {
    idle: 'aura-idle',
    listening: 'aura-listening',
    thinking: 'aura-thinking',
    speaking: 'aura-speaking',
    stopped: 'aura-stopped',
    error: 'aura-error',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw outer glowing speech / listening / thinking ambient aura rings
      const pulseCount = 3;
      for (let i = 0; i < pulseCount; i++) {
        let ringRadius = 180 + i * 25;
        let opacity = 0.2 - i * 0.05;

        if (state === 'speaking') {
          ringRadius += Math.sin(time * 6 + i) * (12 + lipSyncAmplitude * 20);
          opacity = 0.35 + lipSyncAmplitude * 0.25;
        } else if (state === 'listening') {
          ringRadius += Math.sin(time * 4 + i) * (6 + micVolume * 0.2);
          opacity = 0.25 + (micVolume / 100) * 0.35;
        } else if (state === 'thinking') {
          ringRadius += Math.cos(time * 5 + i * 2) * 10;
          opacity = 0.25;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, ringRadius), 0, Math.PI * 2);

        if (state === 'speaking') {
          ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
        } else if (state === 'listening') {
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
        } else if (state === 'thinking') {
          ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
        } else if (state === 'error') {
          ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
        } else {
          ctx.strokeStyle = `rgba(0, 120, 212, ${opacity})`;
        }

        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // 2. Draw Realistic Human Face Lip-Sync Overlay
      // Mouth overlay region over human image portrait
      const mouthX = centerX - 1;
      const mouthY = centerY + 43; // Positioned over portrait mouth area
      const mouthWidth = 46;
      let mouthHeight = 4;

      if (state === 'speaking') {
        // Dynamic mouth opening matching voice speech amplitude
        mouthHeight = 4 + lipSyncAmplitude * 24;
      } else if (state === 'listening') {
        mouthHeight = 5 + (micVolume / 100) * 4;
      }

      if (state === 'speaking' || state === 'listening') {
        // Dark inner mouth cavity
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, mouthWidth / 2, Math.max(2, mouthHeight / 2), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1c0a0a';
        ctx.fill();

        // Upper lip contour
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY - mouthHeight / 4, mouthWidth / 2 + 2, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b85a62';
        ctx.fill();

        // Lower lip contour
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY + mouthHeight / 4, mouthWidth / 2 + 1, Math.max(2, mouthHeight / 3), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#c96b73';
        ctx.fill();
      }

      // 3. Subtle Realistic Eye Blink & Micro-expression overlay
      const leftEyeX = centerX - 42;
      const rightEyeX = centerX + 40;
      const eyeY = centerY - 38;

      let isBlinking = Math.sin(time * 0.4) > 0.97;
      if (isBlinking) {
        ctx.fillStyle = '#261b17';
        ctx.fillRect(leftEyeX - 16, eyeY - 2, 32, 4);
        ctx.fillRect(rightEyeX - 16, eyeY - 2, 32, 4);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [state, lipSyncAmplitude, micVolume]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background soft ambient radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-azure-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Human Figure Avatar Display Container */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Azure Neural Talking Avatar WebRTC Video player if live stream is active */}
        {azureVideoUrl ? (
          <video
            src={azureVideoUrl}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-slate-700/50"
          />
        ) : (
          <div
            className={`relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl flex items-center justify-center transition-all duration-700 border overflow-hidden shadow-2xl bg-slate-900 ${auraClasses[state]}`}
          >
            {/* Photorealistic Human AI Assistant Figure Image */}
            <img
              src="/avatar.jpg"
              alt="Human AI Assistant Figure"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                state === 'speaking'
                  ? 'scale-[1.02] filter brightness-[1.03]'
                  : state === 'listening'
                  ? 'scale-[1.01]'
                  : 'scale-100'
              }`}
            />

            {/* Dynamic Lip-Sync & Expression Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Glassmorphic Gradient Vignette at base of figure */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Floating State Badge Overlay on Avatar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <StateBadge state={state} micMuted={micMuted} />
        </div>
      </div>

      {/* Floating Subtitle / Voice Status Indicator */}
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 font-medium">
        {state === 'listening' && (
          <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
            <Mic className="w-3.5 h-3.5" />
            <span>Listening to your speech...</span>
          </div>
        )}
        {state === 'speaking' && (
          <div className="flex items-center gap-2 text-sky-400">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>AI Avatar is speaking</span>
          </div>
        )}
        {state === 'thinking' && (
          <div className="flex items-center gap-2 text-purple-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Processing response with Azure AI...</span>
          </div>
        )}
        {state === 'idle' && <span>Ready to assist. Click Start or speak naturally.</span>}
      </div>
    </div>
  );
};
