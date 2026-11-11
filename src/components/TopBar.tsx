import React from 'react';
import { Volume2, VolumeX, Sparkles, Waves } from 'lucide-react';

interface TopBarProps {
  activeTab: 'flow' | 'science' | 'ambient';
  onSelectTab: (tab: 'flow' | 'science' | 'ambient') => void;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  onStartFlow: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  isAudioActive,
  onToggleAudio,
  onStartFlow,
}) => {
  return (
    <header className="relative z-40 w-full flex items-center justify-between gap-8 px-6 py-4 border-b border-cyan-500/15 bg-slate-950/60 backdrop-blur-md">
      {/* Zone 1: Brand Wordmark (Single text element in display face) */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('flow');
        }}
        className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2 group"
      >
        <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">OceanFlow</span>
      </a>

      {/* Zone 2: 3-4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
        <button
          type="button"
          onClick={() => onSelectTab('flow')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'flow' ? 'text-cyan-400 font-semibold underline underline-offset-4 decoration-cyan-400/60' : ''
          }`}
        >
          Dance Flow
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('science')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'science' ? 'text-cyan-400 font-semibold underline underline-offset-4 decoration-cyan-400/60' : ''
          }`}
        >
          Fatigue Antidotes
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('ambient')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'ambient' ? 'text-cyan-400 font-semibold underline underline-offset-4 decoration-cyan-400/60' : ''
          }`}
        >
          Ocean Audio Sanctuary
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleAudio}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isAudioActive
              ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={isAudioActive ? 'Ocean audio playing (click to mute)' : 'Unmute ocean surf and ambient chimes'}
          aria-label={isAudioActive ? 'Mute ambient sound' : 'Unmute ambient sound'}
        >
          {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onStartFlow}
          className="px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
        >
          Take a Ocean Breath
        </button>
      </div>
    </header>
  );
};
