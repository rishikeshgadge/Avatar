import React, { useEffect, useRef } from 'react';
import type { AvatarState } from '../types';

interface AvatarCanvasProps {
  state: AvatarState;
  micMuted?: boolean;
  micVolume?: number;
  lipSyncAmplitude?: number;
}

const STATE_COLORS: Record<AvatarState, { primary: string; secondary: string; glow: string }> = {
  idle:      { primary: '#4f9cf9', secondary: '#6366f1', glow: 'rgba(79,156,249,0.3)' },
  listening: { primary: '#2dd4bf', secondary: '#06b6d4', glow: 'rgba(45,212,191,0.4)' },
  thinking:  { primary: '#a78bfa', secondary: '#8b5cf6', glow: 'rgba(167,139,250,0.4)' },
  speaking:  { primary: '#60a5fa', secondary: '#818cf8', glow: 'rgba(96,165,250,0.45)' },
  stopped:   { primary: '#64748b', secondary: '#475569', glow: 'rgba(100,116,139,0.2)' },
  error:     { primary: '#f87171', secondary: '#fb923c', glow: 'rgba(248,113,113,0.35)' },
};

const STATE_LABELS: Record<AvatarState, string> = {
  idle:      'Ready',
  listening: 'Listening',
  thinking:  'Thinking',
  speaking:  'Speaking',
  stopped:   'Offline',
  error:     'Error',
};

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  state,
  micMuted = false,
  micVolume = 0,
  lipSyncAmplitude = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const colors = STATE_COLORS[state];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const render = () => {
      timeRef.current += 0.022;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Background deep-space particles ──────────────────
      for (let i = 0; i < 30; i++) {
        const seed = i * 137.5;
        const px = ((Math.sin(seed) * 0.5 + 0.5) * W + Math.sin(t * 0.3 + seed) * 8) % W;
        const py = ((Math.cos(seed * 0.7) * 0.5 + 0.5) * H + Math.cos(t * 0.2 + seed) * 6) % H;
        const r = 0.5 + Math.abs(Math.sin(t * 0.5 + i)) * 1.2;
        const opacity = 0.2 + Math.abs(Math.sin(t * 0.4 + i * 0.8)) * 0.4;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${opacity * 0.5})`;
        ctx.fill();
      }

      // ── 2. Outer energy rings ────────────────────────────────
      const numRings = state === 'speaking' ? 5 : state === 'listening' ? 4 : 3;
      for (let i = 0; i < numRings; i++) {
        let baseR = 130 + i * 22;
        let ringOpacity = 0.12 - i * 0.025;

        if (state === 'speaking') {
          baseR += Math.sin(t * 9 + i * 1.5) * (14 + lipSyncAmplitude * 28);
          ringOpacity = 0.2 + lipSyncAmplitude * 0.4 - i * 0.04;
        } else if (state === 'listening') {
          baseR += Math.sin(t * 5 + i * 1.2) * (8 + micVolume * 0.25);
          ringOpacity = 0.18 + (micVolume / 100) * 0.3 - i * 0.03;
        } else if (state === 'thinking') {
          baseR += Math.sin(t * 6 + i * 2.1) * 10;
          ringOpacity = 0.15 + Math.abs(Math.sin(t * 2 + i)) * 0.1;
        } else {
          baseR += Math.sin(t * 1.5 + i) * 4;
        }

        const safeAlpha = Math.max(0, Math.min(1, ringOpacity));
        const gradient = ctx.createRadialGradient(cx, cy, Math.max(1, baseR - 2), cx, cy, baseR + 2);
        gradient.addColorStop(0, hexToRgba(colors.primary, 0));
        gradient.addColorStop(0.5, hexToRgba(colors.primary, safeAlpha));
        gradient.addColorStop(1, hexToRgba(colors.primary, 0));

        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, baseR), 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(colors.primary, safeAlpha);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── 3. Orbital particles ────────────────────────────────
      const orbitCount = state === 'thinking' ? 5 : 3;
      for (let i = 0; i < orbitCount; i++) {
        const orbitR = 115 + i * 18;
        const speed = state === 'thinking' ? 1.4 + i * 0.3 : 0.6 + i * 0.2;
        const angle = t * speed + (i * Math.PI * 2) / orbitCount;
        const ox = cx + Math.cos(angle) * orbitR;
        const oy = cy + Math.sin(angle) * orbitR;
        const pr = state === 'thinking' ? 3.5 - i * 0.3 : 2.5;

        const pg = ctx.createRadialGradient(ox, oy, 0, ox, oy, pr * 3);
        pg.addColorStop(0, hexToRgba(colors.secondary, 1));
        pg.addColorStop(1, hexToRgba(colors.secondary, 0));

        ctx.beginPath();
        ctx.arc(ox, oy, pr * 3, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ox, oy, pr, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();
      }

      // ── 4. Central core glow ────────────────────────────────
      let coreR = 95 + Math.sin(t * 1.5) * 3;
      if (state === 'speaking') coreR += lipSyncAmplitude * 12;
      if (state === 'listening') coreR += (micVolume / 100) * 8;

      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.8);
      coreGlow.addColorStop(0, hexToRgba(colors.primary, 0.15));
      coreGlow.addColorStop(0.5, hexToRgba(colors.primary, 0.08));
      coreGlow.addColorStop(1, hexToRgba(colors.primary, 0));

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      // ── 5. AI Face Circle / Holographic visor ───────────────
      const faceR = 90;
      const faceBg = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, faceR);
      faceBg.addColorStop(0, '#111827');
      faceBg.addColorStop(0.7, '#0d1526');
      faceBg.addColorStop(1, '#080d1a');

      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.fillStyle = faceBg;
      ctx.fill();

      // Face border ring
      const faceRing = ctx.createLinearGradient(cx - faceR, cy - faceR, cx + faceR, cy + faceR);
      faceRing.addColorStop(0, hexToRgba(colors.primary, 0.6));
      faceRing.addColorStop(0.5, hexToRgba(colors.secondary, 1));
      faceRing.addColorStop(1, hexToRgba(colors.primary, 0.6));

      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.strokeStyle = faceRing;
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── 6. Eyes ─────────────────────────────────────────────
      const eyeY = cy - 18;
      const eyeOffsetX = 26;
      const eyeW = 18;
      let eyeH = state === 'listening' ? 10 : state === 'speaking' ? 8 : 9;
      const blinkProgress = Math.max(0, Math.sin(t * 0.35) - 0.92) * 12.5;
      const actualEyeH = Math.max(1, eyeH - blinkProgress * eyeH);

      for (const ex of [cx - eyeOffsetX, cx + eyeOffsetX]) {
        // Eye glow
        const eyeGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeW * 1.5);
        eyeGlow.addColorStop(0, hexToRgba(colors.primary, 0.3));
        eyeGlow.addColorStop(1, hexToRgba(colors.primary, 0));
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeW * 1.5, actualEyeH * 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = eyeGlow;
        ctx.fill();

        // Eye body
        const eyeGrad = ctx.createRadialGradient(ex, eyeY - 2, 0, ex, eyeY, eyeW);
        eyeGrad.addColorStop(0, hexToRgba(colors.primary, 1));
        eyeGrad.addColorStop(0.5, hexToRgba(colors.secondary, 0.85));
        eyeGrad.addColorStop(1, '#0d1526');

        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeW, Math.max(0.5, actualEyeH), 0, 0, Math.PI * 2);
        ctx.fillStyle = eyeGrad;
        ctx.fill();

        // Eye highlight
        if (actualEyeH > 2) {
          ctx.beginPath();
          ctx.ellipse(ex + 5, eyeY - 3, 4, 3, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fill();
        }
      }

      // ── 7. Mouth / Lip-sync ─────────────────────────────────
      const mouthY = cy + 30;
      const mouthW = 28;

      if (state === 'speaking') {
        const mouthH = 3 + lipSyncAmplitude * 22;

        // Mouth cavity
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, mouthW, Math.max(2, mouthH / 2 + 1), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0510';
        ctx.fill();

        // Lower lip gradient
        const lipGrad = ctx.createLinearGradient(cx - mouthW, mouthY, cx + mouthW, mouthY + mouthH);
        lipGrad.addColorStop(0, hexToRgba(colors.primary, 0.7));
        lipGrad.addColorStop(1, hexToRgba(colors.secondary, 0.5));

        ctx.beginPath();
        ctx.ellipse(cx, mouthY + mouthH / 4, mouthW + 2, Math.max(2, mouthH * 0.55), 0, 0, Math.PI * 2);
        ctx.fillStyle = lipGrad;
        ctx.fill();

        // Teeth hint
        if (mouthH > 8) {
          ctx.beginPath();
          ctx.ellipse(cx, mouthY - 1, mouthW - 4, Math.min(6, mouthH * 0.3), 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(240,244,255,0.7)';
          ctx.fill();
        }
      } else if (state === 'listening') {
        // Gentle open mouth
        const mouthH = 2 + (micVolume / 100) * 6;
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, mouthW - 4, Math.max(1.5, mouthH / 2), 0, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(colors.primary, 0.2);
        ctx.strokeStyle = hexToRgba(colors.primary, 0.6);
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      } else {
        // Neutral smile
        ctx.beginPath();
        ctx.moveTo(cx - mouthW + 4, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + 8, cx + mouthW - 4, mouthY);
        ctx.strokeStyle = hexToRgba(colors.primary, 0.7);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── 8. Thinking dots ────────────────────────────────────
      if (state === 'thinking') {
        for (let i = 0; i < 3; i++) {
          const dotX = cx + (i - 1) * 14;
          const dotY = cy + 55 + Math.sin(t * 5 + i * 1.2) * 5;
          const dotR = 3 + Math.abs(Math.sin(t * 3 + i)) * 2;

          const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotR * 2.5);
          dotGlow.addColorStop(0, hexToRgba(colors.secondary, 0.6));
          dotGlow.addColorStop(1, hexToRgba(colors.secondary, 0));
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = dotGlow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = colors.secondary;
          ctx.fill();
        }
      }

      // ── 9. Sound wave bars (listening/speaking) ──────────────
      if (state === 'speaking' || state === 'listening') {
        const bars = 12;
        const barSpacing = 10;
        const totalW = bars * barSpacing;
        const startX = cx - totalW / 2 + barSpacing / 2;
        const waveY = cy + 60;

        for (let i = 0; i < bars; i++) {
          const bx = startX + i * barSpacing;
          const phase = (i / bars) * Math.PI * 2 + t * 8;
          let amp = Math.abs(Math.sin(phase)) * 0.7 + 0.3;

          if (state === 'speaking') amp *= 0.6 + lipSyncAmplitude * 0.8;
          if (state === 'listening') amp *= 0.4 + (micVolume / 100) * 0.8;

          const bh = Math.max(2, amp * 18);
          const alpha = Math.max(0, Math.min(1, 0.5 + amp * 0.5));

          const barGrad = ctx.createLinearGradient(bx, waveY - bh, bx, waveY + bh);
          barGrad.addColorStop(0, hexToRgba(colors.secondary, alpha));
          barGrad.addColorStop(1, hexToRgba(colors.primary, alpha));

          ctx.beginPath();
          ctx.roundRect(bx - 2, waveY - bh, 4, bh * 2, 2);
          ctx.fillStyle = barGrad;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, lipSyncAmplitude, micVolume, colors]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Deep ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${colors.glow} 0%, transparent 65%)`,
        }}
      />

      {/* Avatar canvas */}
      <div className="relative flex-shrink-0">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80"
        />

        {/* Mic muted badge */}
        {micMuted && (
          <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.293 2.293a1 1 0 011.414 0L17 15.586a1 1 0 01-1.414 1.414L2.293 3.707a1 1 0 010-1.414z" clipRule="evenodd" />
              <path d="M7 4a3 3 0 016 0v4a3 3 0 01-.865 2.122L7.272 4.272A3 3 0 017 4zM3 10a1 1 0 012 0 5 5 0 008.535 3.536l1.413 1.413A7 7 0 013.07 11H3a1 1 0 010-2z" />
            </svg>
          </div>
        )}
      </div>

      {/* ARIA Name + state label */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <h2 className="text-xl font-bold tracking-widest animate-shimmer">
          ARIA
        </h2>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-500"
          style={{
            background: hexToRgba(colors.primary, 0.1),
            border: `1px solid ${hexToRgba(colors.primary, 0.3)}`,
            color: colors.primary,
          }}
        >
          {/* State dot */}
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: colors.primary,
              boxShadow: `0 0 6px ${colors.primary}`,
              animation: state === 'idle' || state === 'stopped' ? 'none' : 'ring-pulse 1.5s ease-in-out infinite',
            }}
          />
          {STATE_LABELS[state]}
          {state === 'listening' && !micMuted && (
            <span className="opacity-60">· speak now</span>
          )}
        </div>
      </div>
    </div>
  );
};
