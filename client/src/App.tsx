import { useState } from 'react';
import { Header } from './components/Header';
import { AvatarCanvas } from './components/AvatarCanvas';
import { ChatPanel } from './components/ChatPanel';
import { VoiceControlBar } from './components/VoiceControlBar';
import { SettingsModal } from './components/SettingsModal';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

export function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    avatarState,
    language,
    messages,
    sessionActive,
    micMuted,
    micVolume,
    lipSyncAmplitude,
    interimTranscript,
    serverHealth,
    isProcessing,
    handleStartSession,
    handleStopSession,
    toggleMic,
    sendManualMessage,
    clearChat,
  } = useVoiceAssistant();

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden select-none"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79,156,249,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,156,249,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <Header
        serverHealth={serverHealth}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-5 overflow-hidden min-h-0">
        {/* Avatar Panel */}
        <section
          className="lg:col-span-5 xl:col-span-5 flex flex-col rounded-3xl overflow-hidden relative"
          style={{
            background: 'rgba(8,13,26,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Top label */}
          <div
            className="px-5 py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#2d3748', fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Avatar
            </span>
            <div
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: avatarState === 'listening' ? 'rgba(45,212,191,0.1)' :
                  avatarState === 'speaking' ? 'rgba(79,156,249,0.1)' :
                  avatarState === 'thinking' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
                border: avatarState === 'listening' ? '1px solid rgba(45,212,191,0.25)' :
                  avatarState === 'speaking' ? '1px solid rgba(79,156,249,0.25)' :
                  avatarState === 'thinking' ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(255,255,255,0.05)',
                color: avatarState === 'listening' ? '#2dd4bf' :
                  avatarState === 'speaking' ? '#4f9cf9' :
                  avatarState === 'thinking' ? '#a78bfa' : '#2d3748',
              }}
            >
              {language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Marathi'}
            </div>
          </div>

          {/* Avatar canvas area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AvatarCanvas
              state={avatarState}
              micMuted={micMuted}
              micVolume={micVolume}
              lipSyncAmplitude={lipSyncAmplitude}
            />
          </div>
        </section>

        {/* Chat Panel */}
        <section className="lg:col-span-7 xl:col-span-7 h-full min-h-0 overflow-hidden">
          <ChatPanel
            messages={messages}
            interimTranscript={interimTranscript}
            onSendMessage={sendManualMessage}
            onClearChat={clearChat}
            currentLanguage={language}
            isProcessing={isProcessing}
          />
        </section>
      </main>

      {/* Voice Control Bar */}
      <VoiceControlBar
        avatarState={avatarState}
        sessionActive={sessionActive}
        micMuted={micMuted}
        onStartSession={handleStartSession}
        onStopSession={handleStopSession}
        onToggleMic={toggleMic}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverHealth={serverHealth}
      />
    </div>
  );
}

export default App;
