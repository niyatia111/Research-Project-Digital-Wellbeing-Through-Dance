/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Wind, Eye, RotateCcw, Volume2, Shield, Heart } from 'lucide-react';
import { OCEAN_DANCE_POSES } from './data/poses';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { TopBar } from './components/TopBar';
import { PoseCameraView } from './components/PoseCameraView';
import { PoseGuideCard } from './components/PoseGuideCard';
import { FatigueScienceView } from './components/FatigueScienceView';
import { AmbientAudioSanctuary } from './components/AmbientAudioSanctuary';
import { DigitalFatigueReport } from './components/DigitalFatigueReport';
import { oceanAudio } from './utils/audioSynthesizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'flow' | 'science' | 'ambient'>('flow');
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [sceneMode, setSceneMode] = useState<'sunset' | 'coastal'>('sunset');
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isDeskMode, setIsDeskMode] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Session tracking
  const [sessionActiveSeconds, setSessionActiveSeconds] = useState<number>(0);
  const [totalPosesCompleted, setTotalPosesCompleted] = useState<number>(0);
  const [totalFlowsCompleted, setTotalFlowsCompleted] = useState<number>(0);

  const currentPose = OCEAN_DANCE_POSES[currentPoseIndex];

  // Active session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionActiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle ambient audio toggle
  const handleToggleAudio = useCallback(async () => {
    if (!isAudioActive) {
      await oceanAudio.start();
      setIsAudioActive(true);
    } else {
      const muted = oceanAudio.toggleMute();
      setIsAudioActive(!muted);
    }
  }, [isAudioActive]);

  // Handle successful pose completion
  const handlePoseCompleted = useCallback(() => {
    setTotalPosesCompleted((prev) => prev + 1);

    if (currentPoseIndex < OCEAN_DANCE_POSES.length - 1) {
      setCurrentPoseIndex((prev) => prev + 1);
    } else {
      // Completed full flow of 8 restorative poses!
      setTotalFlowsCompleted((prev) => prev + 1);
      setShowSummaryModal(true);
      setCurrentPoseIndex(0);
    }
  }, [currentPoseIndex]);

  const handleNextPose = useCallback(() => {
    if (currentPoseIndex < OCEAN_DANCE_POSES.length - 1) {
      setCurrentPoseIndex((prev) => prev + 1);
    } else {
      setCurrentPoseIndex(0);
    }
  }, [currentPoseIndex]);

  const handlePrevPose = useCallback(() => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex((prev) => prev - 1);
    }
  }, [currentPoseIndex]);

  const handleSelectPose = useCallback((index: number) => {
    setCurrentPoseIndex(index);
  }, []);

  const handleRestartSession = useCallback(() => {
    setShowSummaryModal(false);
    setCurrentPoseIndex(0);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden select-none">
      {/* Immersive Ocean Background Layer */}
      <OceanAtmosphere
        sceneMode={sceneMode}
        breathPhase={currentPose.breathPhase}
        isDancing={activeTab === 'flow'}
      />

      {/* Top Bar Contract (§2 of Frontend Design Constitution) */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        onStartFlow={() => {
          setActiveTab('flow');
          if (!isAudioActive) {
            handleToggleAudio();
          }
        }}
      />

      {/* Main View Area */}
      <main className="relative z-20 flex-1 flex flex-col justify-start py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {activeTab === 'flow' && (
          <div className="space-y-6">
            {/* Mindful Intent Header */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Digital Fatigue Recovery Dance</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
                Dance With the Ocean Breath
              </h1>
              <p className="text-sm text-cyan-100/80 mt-1 max-w-lg mx-auto">
                Copy the serene posture shown on screen. Hold gently for a couple seconds with the ocean swell to dissolve screen fatigue.
              </p>
            </div>

            {/* Split Interactive Stage: Left Camera & MediaPipe Tracking / Right Pose Guide Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* MediaPipe Real-Time Pose Viewport */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <PoseCameraView
                  currentPose={currentPose}
                  onPoseCompleted={handlePoseCompleted}
                  isAudioActive={isAudioActive}
                  isDeskMode={isDeskMode}
                  onToggleDeskMode={() => setIsDeskMode((prev) => !prev)}
                />

                {/* Subtle Posture Comfort Reminder */}
                <div className="mt-3 flex items-center justify-between w-full max-w-2xl px-2 text-[11px] text-cyan-300/70">
                  <span>Detection is forgiving & natural for all skill levels</span>
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(true)}
                    className="hover:text-cyan-200 underline underline-offset-2 cursor-pointer"
                  >
                    View Mindful Stats
                  </button>
                </div>
              </div>

              {/* Pose Guide Card & Digital Fatigue Antidote */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <PoseGuideCard
                  pose={currentPose}
                  currentIndex={currentPoseIndex}
                  totalPoses={OCEAN_DANCE_POSES.length}
                  onNextPose={handleNextPose}
                  onPrevPose={handlePrevPose}
                  onSelectPose={handleSelectPose}
                />

                {/* Ambient Quick-Action Widget */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-cyan-500/20 backdrop-blur-md text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Ocean Wave Breath</p>
                      <p className="text-[11px] text-slate-400">
                        {currentPose.breathPhase}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition-colors cursor-pointer text-xs"
                  >
                    {isAudioActive ? 'Mute Waves' : 'Play Surf Sound'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'science' && (
          <FatigueScienceView onStartFlow={() => setActiveTab('flow')} />
        )}

        {activeTab === 'ambient' && (
          <AmbientAudioSanctuary
            isAudioActive={isAudioActive}
            onToggleAudio={handleToggleAudio}
            sceneMode={sceneMode}
            onToggleScene={setSceneMode}
          />
        )}
      </main>

      {/* Digital Fatigue Summary Modal */}
      {showSummaryModal && (
        <DigitalFatigueReport
          completedFlows={totalFlowsCompleted}
          totalPosesDone={totalPosesCompleted}
          activeSeconds={sessionActiveSeconds}
          onRestart={handleRestartSession}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {/* Quiet Footer with Respect to §1.B */}
      <footer className="relative z-30 w-full py-4 px-6 border-t border-cyan-500/15 bg-slate-950/60 backdrop-blur-md text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>OceanFlow · Mindful Movement for Screen Rest</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Real-Time MediaPipe Vision</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveTab('science')}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Digital Fatigue Guide
          </button>
        </div>
      </footer>
    </div>
  );
}
