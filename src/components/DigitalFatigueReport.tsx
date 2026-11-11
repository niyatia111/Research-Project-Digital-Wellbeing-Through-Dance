import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Heart, Eye, ArrowRight } from 'lucide-react';

interface DigitalFatigueReportProps {
  completedFlows: number;
  totalPosesDone: number;
  activeSeconds: number;
  onRestart: () => void;
  onClose: () => void;
}

export const DigitalFatigueReport: React.FC<DigitalFatigueReportProps> = ({
  completedFlows,
  totalPosesDone,
  activeSeconds,
  onRestart,
  onClose,
}) => {
  const minutes = Math.floor(activeSeconds / 60);
  const seconds = activeSeconds % 60;

  const benefitsAchieved = [
    {
      title: 'Optic Nerve Recovery',
      desc: 'Looking up and beyond the screen boundary rested fatigued focal eye muscles.',
    },
    {
      title: 'Reversed Tech Neck & Hunch',
      desc: 'Shoulder blades were engaged backward and upper spine decompressed.',
    },
    {
      title: 'Thoracic Expansion',
      desc: 'Deep rhythmic ocean breathing restored oxygen saturation.',
    },
    {
      title: 'Wrist & Forearm Release',
      desc: 'Fluid waving movements released mouse and keyboard flexor tightness.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 md:p-8 shadow-2xl text-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Ocean Flow Completed
          </h2>
          <p className="text-sm text-cyan-200/90 mt-1">
            Your body and nervous system have been cleansed of digital fatigue.
          </p>
        </div>

        {/* Key Session Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-center">
          <div>
            <p className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Mindful Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {totalPosesDone}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Poses Flowed</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {completedFlows}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Cycles Done</p>
          </div>
        </div>

        {/* Benefits Realized */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tension Relieved Today
          </h4>
          <div className="space-y-2">
            {benefitsAchieved.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">{b.title}:</span>{' '}
                  <span className="text-slate-300">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mindful Advice Quote */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 italic mb-6 text-center">
          "Like the tide that leaves the shore only to return renewed, remember to soften your shoulders and breathe with the ocean."
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Flow Again</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
