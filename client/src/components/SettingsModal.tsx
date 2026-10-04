import React from 'react';
import { X, Server, Key, Cpu, Sparkles, Database } from 'lucide-react';
import type { ServerHealth } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverHealth: ServerHealth | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  serverHealth,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-slate-700/80 p-6 shadow-2xl overflow-hidden relative animate-float">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-azure-600/20 border border-azure-500/30 text-azure-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Azure Infrastructure & Diagnostics
            </h2>
            <p className="text-xs text-slate-400">
              Connected Azure AI Foundry & Speech Services
            </p>
          </div>
        </div>

        {/* Diagnostic Status Cards */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-azure-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">
                  Azure AI Foundry Agent
                </span>
                <span className="text-[11px] text-slate-400">
                  {serverHealth?.azureFoundryConnected
                    ? 'Connected to live Foundry Agent'
                    : 'Simulation Mode Active'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-teal-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">
                  Azure Speech / Neural Avatar
                </span>
                <span className="text-[11px] text-slate-400">
                  {serverHealth?.azureSpeechConnected
                    ? 'Azure Speech Token Active'
                    : 'Browser Speech Fallback'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Database className="w-4 h-4 text-purple-400 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block mb-0.5">
                Azure Cosmos DB Storage
              </span>
              <span className="text-[11px] text-slate-400">
                {serverHealth?.cosmosDbConnected
                  ? 'Cosmos DB collection connected'
                  : 'In-Memory session thread handling (Cosmos DB optional)'}
              </span>
            </div>
          </div>

          {/* Environmental Instructions */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-azure-400 font-semibold">
              <Key className="w-3.5 h-3.5" />
              <span>Connecting your live Azure keys:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To bind your live Azure AI Foundry Agent & Azure Speech keys, configure the variables in{' '}
              <code className="text-azure-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                server/.env
              </code>:
            </p>
            <pre className="text-[10px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 font-mono overflow-x-auto">
{`AZURE_AI_FOUNDRY_ENDPOINT=https://<your-resource>.services.ai.azure.com
AZURE_AI_FOUNDRY_AGENT_ID=asst_xyz123
AZURE_OPENAI_API_KEY=your_key
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastus
SIMULATION_MODE=false`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-azure-600 hover:bg-azure-500 text-white font-medium text-xs shadow-md transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
