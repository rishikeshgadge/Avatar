import React from 'react';
import { Bot, Settings, Database, Cpu, Sparkles } from 'lucide-react';
import type { ServerHealth } from '../types';

interface HeaderProps {
  serverHealth: ServerHealth | null;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ serverHealth, onOpenSettings }) => {
  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between z-30 relative">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-azure-600 via-sky-500 to-teal-400 p-[1px] shadow-lg shadow-azure-950/50">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-azure-500" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm tracking-wide text-slate-100 uppercase">
              Azure AI Foundry Avatar
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-azure-500/10 text-azure-400 border border-azure-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Foundry Agent
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            Enterprise Multilingual Conversational Avatar
          </p>
        </div>
      </div>

      {/* Backend & Azure Capability Statuses */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2.5">
          {/* Azure Agent Connection Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${
              serverHealth?.azureFoundryConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}
            title="Azure AI Foundry Agent Integration Status"
          >
            <Cpu className="w-3 h-3" />
            <span>
              {serverHealth?.azureFoundryConnected ? 'Agent Connected' : 'Foundry Simulated'}
            </span>
          </div>

          {/* Cosmos DB Persistence Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${
              serverHealth?.cosmosDbConnected
                ? 'bg-sky-950/40 border-sky-500/30 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Azure Cosmos DB Storage Status"
          >
            <Database className="w-3 h-3" />
            <span>{serverHealth?.cosmosDbConnected ? 'Cosmos DB' : 'In-Memory'}</span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Azure Credentials & Diagnostics"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
