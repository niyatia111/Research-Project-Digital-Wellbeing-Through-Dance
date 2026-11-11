import React from 'react';
import { ChevronLeft, ChevronRight, Wind, Heart, Sparkles, Monitor } from 'lucide-react';
import { DancePose } from '../types/dance';

interface PoseGuideCardProps {
  pose: DancePose;
  currentIndex: number;
  totalPoses: number;
  onNextPose: () => void;
  onPrevPose: () => void;
  onSelectPose: (index: number) => void;
}

export const PoseGuideCard: React.FC<PoseGuideCardProps> = ({
  pose,
  currentIndex,
  totalPoses,
  onNextPose,
  onPrevPose,
  onSelectPose,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-6 shadow-xl text-slate-200">
      {/* Header: Move index, Poetic Tag, and Breath Phase */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-xs text-cyan-300/80">
          <span className="font-medium">Move {currentIndex + 1} of {totalPoses}</span>
          <span aria-hidden="true">·</span>
          <span className="italic">{pose.sanskritOrPoeticName}</span>
        </div>

        {/* Breath indicator with gentle wave icon */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-medium text-cyan-200">
          <Wind className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{pose.breathPhase}</span>
        </div>
      </div>

      {/* Primary Pose Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
          {pose.name}
        </h2>
        <p className="text-sm text-cyan-200/90 mt-0.5">
          {pose.subtitle}
        </p>
      </div>

      {/* Movement Description */}
      <p className="text-sm text-slate-300 leading-relaxed mb-5">
        {pose.description}
      </p>

      {/* Digital Fatigue Healing Spotlight */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/15 mb-5 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
          <Monitor className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Digital Fatigue Antidote
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-normal">
            {pose.fatigueBenefit}
          </p>
        </div>
      </div>

      {/* Pose Navigation & Progress Strip */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onPrevPose}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Step dots for each pose */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPoses }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPose(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === currentIndex
                  ? 'w-6 bg-cyan-400'
                  : i < currentIndex
                  ? 'w-2 bg-cyan-600/70'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Go to pose ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onNextPose}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span>Skip to Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
