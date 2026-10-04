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
    handleStartSession,
    handleStopSession,
    toggleMic,
    sendManualMessage,
    clearChat,
  } = useVoiceAssistant();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header Bar */}
      <Header
        serverHealth={serverHealth}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Desktop Body Split View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6 relative">
        {/* Left Column: Photorealistic Human AI Avatar (Centerpiece) */}
        <section className="lg:col-span-7 h-full flex flex-col items-center justify-center glass-panel rounded-3xl relative border border-slate-800/80 shadow-2xl overflow-hidden">
          <AvatarCanvas
            state={avatarState}
            micMuted={micMuted}
            micVolume={micVolume}
            lipSyncAmplitude={lipSyncAmplitude}
          />
        </section>

        {/* Right Column: Chat History & Input Panel */}
        <section className="lg:col-span-5 h-full overflow-hidden">
          <ChatPanel
            messages={messages}
            interimTranscript={interimTranscript}
            onSendMessage={sendManualMessage}
            onClearChat={clearChat}
            currentLanguage={language}
          />
        </section>
      </main>

      {/* 3. Bottom Minimal Voice Control Dock */}
      <VoiceControlBar
        avatarState={avatarState}
        sessionActive={sessionActive}
        micMuted={micMuted}
        onStartSession={handleStartSession}
        onStopSession={handleStopSession}
        onToggleMic={toggleMic}
      />

      {/* 4. Diagnostics & Azure Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverHealth={serverHealth}
      />
    </div>
  );
}

export default App;
