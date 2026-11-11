import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Wind, Bell, Mountain, Image } from 'lucide-react';
import { oceanAudio } from '../utils/audioSynthesizer';

interface AmbientAudioSanctuaryProps {
  isAudioActive: boolean;
  onToggleAudio: () => void;
  sceneMode: 'sunset' | 'coastal';
  onToggleScene: (mode: 'sunset' | 'coastal') => void;
}

export const AmbientAudioSanctuary: React.FC<AmbientAudioSanctuaryProps> = ({
  isAudioActive,
  onToggleAudio,
  sceneMode,
  onToggleScene,
}) => {
  const [volume, setVolume] = useState<number>(0.5);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    oceanAudio.setVolume(val);
  };

  const handleTestBowl = () => {
    oceanAudio.playSingingBowl('complete');
  };

  return (
    <div className="relative z-30 max-w-3xl mx-auto px-6 py-8 text-slate-200">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Ocean Audio Sanctuary
        </h2>
        <p className="text-sm text-cyan-200/90 mt-2">
          Calm your nervous system with procedural ocean waves and 432Hz resonant harmonic frequencies.
        </p>
      </div>

      {/* Main Soundscape Control Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md mb-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Procedural Ocean Ambience</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time pink noise sea swell and warm soothing drone
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isAudioActive ? 'Audio Playing' : 'Start Ocean Sound'}</span>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Master Ocean Sanctuary Volume</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Singing Bowl Sound Preview */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Tibetan Singing Bowl Chime</p>
              <p className="text-[11px] text-slate-400">Plays when holding a pose and upon completion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestBowl}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Preview Tone
          </button>
        </div>
      </div>

      {/* Visual Ocean Scene Selection */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md mb-6 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-1">Visual Sanctuary Atmosphere</h3>
        <p className="text-xs text-slate-400 mb-4">
          Choose the panoramic ocean vista that best calms your mind
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onToggleScene('sunset')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              sceneMode === 'sunset'
                ? 'bg-cyan-950/50 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2 bg-slate-900">
              <img
                src="/src/assets/images/ocean_sunset_shore_1794433256575.jpg"
                alt="Sunset Beach"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-xs text-slate-200">Twilight Sunset Shore</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Soft lavender skies, warm reflections, gentle tide washes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onToggleScene('coastal')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              sceneMode === 'coastal'
                ? 'bg-cyan-950/50 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2 bg-slate-900">
              <img
                src="/src/assets/images/ocean_coastal_rocks_1794433256770.jpg"
                alt="Coastal Rocks"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-xs text-slate-200">Coastal Mist Haven</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Golden dawn sunlight, turquoise tide pools, peaceful pebbles.
            </p>
          </button>
        </div>
      </div>

      {/* Visual Ocean Breathing Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md text-center shadow-xl flex flex-col items-center">
        <Wind className="w-5 h-5 text-cyan-400 mb-2" />
        <h3 className="text-base font-semibold text-white">Ocean Breath Synchronization</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Inhale as the circle gently blooms, exhale as it recedes into the deep sea.
        </p>

        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-breathe" />
          <div className="w-24 h-24 rounded-full border border-cyan-400/40 flex items-center justify-center text-xs font-medium text-cyan-200 animate-breathe">
            Ocean Tide
          </div>
        </div>
      </div>
    </div>
  );
};
