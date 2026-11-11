import React from 'react';
import { Eye, Shield, Wind, Sparkles, Monitor, Activity, ArrowRight } from 'lucide-react';
import { OCEAN_DANCE_POSES } from '../data/poses';

interface FatigueScienceViewProps {
  onStartFlow: () => void;
}

export const FatigueScienceView: React.FC<FatigueScienceViewProps> = ({ onStartFlow }) => {
  const fatigueSyndromes = [
    {
      title: 'Forward Head & Screen Hunch',
      icon: Shield,
      mechanic: 'For every 1 inch the head tilts forward over a keyboard, the cervical spine bears an additional 10 lbs of force.',
      relief: 'Poses like Horizon Wings & Rising Tide pull rhomboid muscles back, realigning the 7 cervical vertebrae.',
    },
    {
      title: 'Digital Eye Strain & Ciliary Spasm',
      icon: Eye,
      mechanic: 'Staring at close emissive screens freezes the ciliary muscles in a continuous state of high focal contraction.',
      relief: 'Looking up into the wide ocean sky in Sun Cresting the Ocean relaxes ciliary tension and stimulates peripheral vision.',
    },
    {
      title: 'Screen Apnea (Shallow Breathing)',
      icon: Wind,
      mechanic: '80% of computer users unconsciously hold their breath or breathe in shallow chest gasps while processing emails.',
      relief: 'Synchronizing rhythmic ocean sway with 6-to-8 second swells activates the vagus nerve and lowers resting heart rate.',
    },
    {
      title: 'Repetitive Carpal Stasis',
      icon: Activity,
      mechanic: 'Holding a mouse and typing locks the wrist flexors into chronic shortened states, reducing blood flow.',
      relief: 'Rolling Wave Flow extends the palmar fascia and restores synovial fluid circulation throughout the wrists and fingers.',
    },
  ];

  return (
    <div className="relative z-30 max-w-4xl mx-auto px-6 py-8 text-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          How Gentle Ocean Movement Heals Digital Fatigue
        </h2>
        <p className="text-sm text-cyan-200/90 mt-2 leading-relaxed">
          Screen fatigue isn't just mental—it is a physical posture reflex stored in fascia, tight traps, and frozen eye muscles.
        </p>
      </div>

      {/* Grid of 4 Digital Fatigue Antidotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {fatigueSyndromes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                <strong className="text-slate-300 font-medium">The Strain:</strong> {item.mechanic}
              </p>
              <p className="text-xs text-cyan-300/90 leading-relaxed">
                <strong className="text-cyan-200 font-medium">The Ocean Cure:</strong> {item.relief}
              </p>
            </div>
          );
        })}
      </div>

      {/* 20-20-20 Ocean Horizon Practice */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900/80 border border-cyan-500/30 backdrop-blur-md mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optic Resting Horizon</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">
            Rest Your Eyes on the Ocean Horizon
          </h4>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Every 20 minutes, gaze at the horizon for 20 seconds. OceanFlow incorporates wide-sky poses so your peripheral gaze naturally expands beyond screen boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartFlow}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <span>Begin Dance Flow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dance Move Catalog Summary */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 font-display">
          The 8 Restorative Ocean Movements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {OCEAN_DANCE_POSES.map((pose, i) => (
            <div
              key={pose.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
            >
              <div className="text-cyan-400/80 font-mono text-[10px] mb-1">
                Move {i + 1}
              </div>
              <h4 className="font-semibold text-slate-200 truncate">{pose.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {pose.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
