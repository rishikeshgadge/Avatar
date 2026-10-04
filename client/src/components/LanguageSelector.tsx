import React from 'react';
import type { LanguageCode, LanguageOption } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
      <div className="px-2 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-azure-600 text-white shadow-md shadow-azure-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="mr-1">{lang.nativeName}</span>
              <span className="opacity-60 text-[10px]">({lang.code.toUpperCase()})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
