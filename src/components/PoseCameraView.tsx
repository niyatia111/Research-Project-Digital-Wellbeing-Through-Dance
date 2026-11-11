import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Camera, CameraOff, Sparkles, Eye, FlipHorizontal, RefreshCw, Volume2, CheckCircle2 } from 'lucide-react';
import { DancePose, LandmarkPoint, MatchResult } from '../types/dance';
import { getPoseLandmarker, drawOceanSkeleton } from '../utils/mediaPipeService';
import { evaluatePoseMatch } from '../utils/poseMatching';
import { oceanAudio } from '../utils/audioSynthesizer';
import { PoseGhostGuide } from './PoseGhostGuide';

interface PoseCameraViewProps {
  currentPose: DancePose;
  onPoseCompleted: () => void;
  isAudioActive: boolean;
  isDeskMode: boolean;
  onToggleDeskMode: () => void;
}

export const PoseCameraView: React.FC<PoseCameraViewProps> = ({
  currentPose,
  onPoseCompleted,
  isAudioActive,
  isDeskMode,
  onToggleDeskMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'simulated'>('requesting');
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [matchResult, setMatchResult] = useState<MatchResult>({
    accuracy: 0,
    isMatching: false,
    coachingMessage: 'Initializing camera...',
    jointFeedback: { leftArm: 'neutral', rightArm: 'neutral', posture: 'neutral' },
  });

  const [holdProgress, setHoldProgress] = useState<number>(0); // 0 to 1
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Simulation controls state for fallback/preview
  const [simulatedMatchActive, setSimulatedMatchActive] = useState<boolean>(false);

  // References for animation frame loop
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const holdStartTimeRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // Initialize camera and MediaPipe
  const startCamera = useCallback(async () => {
    try {
      setCameraState('requesting');
      setModelLoading(true);

      // Preload MediaPipe model in background
      getPoseLandmarker()
        .then(() => setModelLoading(false))
        .catch((err) => {
          console.warn('MediaPipe model load warning:', err);
          setModelLoading(false);
        });

      // Request webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraState('active');
        };
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraState('denied');
      setModelLoading(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup webcam stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [startCamera]);

  // Reset hold state whenever currentPose changes
  useEffect(() => {
    holdStartTimeRef.current = null;
    isCompletedRef.current = false;
    setHoldProgress(0);
    setIsHolding(false);
    setSimulatedMatchActive(false);
  }, [currentPose.id]);

  // Handle successful pose completion
  const triggerPoseSuccess = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    // Resonant singing bowl harmonic
    oceanAudio.playSingingBowl('complete');

    // Peaceful soft water-blue confetti burst
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#7dd3fc', '#bae6fd', '#f0fdfa'],
        ticks: 180,
      });
    } catch {
      // ignore
    }

    // Smooth advance to next pose
    setTimeout(() => {
      onPoseCompleted();
    }, 600);
  }, [onPoseCompleted]);

  // Real-time detection loop
  useEffect(() => {
    let active = true;

    const detectFrame = async () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (cameraState === 'active' && video && video.readyState >= 2 && canvas) {
        const ctx = canvas.getContext('2d');

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        try {
          const landmarker = await getPoseLandmarker();

          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            const startTimeMs = performance.now();
            const poseResult = landmarker.detectForVideo(video, startTimeMs);

            if (poseResult.landmarks && poseResult.landmarks.length > 0) {
              const landmarks = poseResult.landmarks[0] as LandmarkPoint[];

              // Draw skeleton overlay if enabled
              if (ctx && showSkeleton) {
                drawOceanSkeleton(
                  ctx,
                  landmarks,
                  canvas.width,
                  canvas.height,
                  matchResult.isMatching,
                  isMirrored
                );
              } else if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }

              // Evaluate pose alignment against current target
              const evalResult = evaluatePoseMatch(landmarks, currentPose);
              setMatchResult(evalResult);

              // Update hold progress
              if (evalResult.isMatching && !isCompletedRef.current) {
                if (!holdStartTimeRef.current) {
                  holdStartTimeRef.current = performance.now();
                  setIsHolding(true);
                  oceanAudio.playSingingBowl('match');
                } else {
                  const elapsed = (performance.now() - holdStartTimeRef.current) / 1000;
                  const targetDuration = currentPose.holdDurationSeconds;
                  const progress = Math.min(1, elapsed / targetDuration);
                  setHoldProgress(progress);

                  if (progress >= 1 && !isCompletedRef.current) {
                    triggerPoseSuccess();
                  }
                }
              } else {
                // If match drops, gently decay hold timer rather than harsh instant reset
                if (holdStartTimeRef.current && !isCompletedRef.current) {
                  holdStartTimeRef.current = null;
                  setIsHolding(false);
                  setHoldProgress((prev) => Math.max(0, prev - 0.05));
                }
              }
            } else if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setMatchResult({
                accuracy: 0,
                isMatching: false,
                coachingMessage: 'Step back so your upper body is framed',
                jointFeedback: { leftArm: 'neutral', rightArm: 'neutral', posture: 'neutral' },
              });
            }
          }
        } catch {
          // ignore transient detection frame skip
        }
      } else if (cameraState === 'simulated' || simulatedMatchActive) {
        // Simulation mode progression
        const simAccuracy = simulatedMatchActive ? 88 : 55;
        const isMatch = simAccuracy >= 65;

        setMatchResult({
          accuracy: simAccuracy,
          isMatching: isMatch,
          coachingMessage: isMatch
            ? 'Mindful posture aligned! Holding with the breath...'
            : currentPose.cue,
          jointFeedback: { leftArm: 'good', rightArm: 'good', posture: 'good' },
        });

        if (simulatedMatchActive && !isCompletedRef.current) {
          if (!holdStartTimeRef.current) {
            holdStartTimeRef.current = performance.now();
            setIsHolding(true);
            oceanAudio.playSingingBowl('match');
          } else {
            const elapsed = (performance.now() - holdStartTimeRef.current) / 1000;
            const progress = Math.min(1, elapsed / currentPose.holdDurationSeconds);
            setHoldProgress(progress);

            if (progress >= 1) {
              triggerPoseSuccess();
            }
          }
        }
      }

      requestRef.current = requestAnimationFrame(detectFrame);
    };

    requestRef.current = requestAnimationFrame(detectFrame);

    return () => {
      active = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    cameraState,
    currentPose,
    showSkeleton,
    isMirrored,
    simulatedMatchActive,
    triggerPoseSuccess,
    matchResult.isMatching,
  ]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/70 shadow-2xl backdrop-blur-md">
      {/* Video Viewport Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-900/90 overflow-hidden flex items-center justify-center">
        {/* Real Webcam Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraState === 'active' ? 'opacity-100' : 'opacity-0'
          } ${isMirrored ? 'scale-x-[-1]' : ''}`}
        />

        {/* Luminous Skeleton Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            showSkeleton ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Holographic Target Pose Silhouette Guide */}
        {showGhostGuide && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none">
            <PoseGhostGuide
              pose={currentPose}
              accuracy={matchResult.accuracy}
              isMatching={matchResult.isMatching}
              className="w-full h-full max-w-md max-h-[85%]"
            />
          </div>
        )}

        {/* State: Camera Loading */}
        {cameraState === 'requesting' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center text-slate-300">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-medium">Opening camera for gentle tracking...</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              All video stays completely private in your browser.
            </p>
          </div>
        )}

        {/* State: Camera Denied or Unavailable -> Friendly Simulation Mode */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center">
            <CameraOff className="w-10 h-10 text-cyan-400/70 mb-3" />
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Webcam Access Not Detected
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">
              You can still practice all ocean restorative dance poses freely! Use the interactive mirror simulation below to experience the flow.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCameraState('simulated')}
                className="px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
              >
                Enter Practice Simulator
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* State: Practice Simulator Active */}
        {cameraState === 'simulated' && (
          <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/60 to-cyan-950/30 p-4">
            <div className="text-center mb-6">
              <p className="text-xs font-medium tracking-wide text-cyan-300 uppercase">
                Interactive Practice Mode
              </p>
              <p className="text-sm text-slate-300 mt-1 max-w-xs">
                Follow the luminous target pose on screen. Tap below to simulate gentle alignment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSimulatedMatchActive((prev) => !prev)}
              className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-lg cursor-pointer ${
                simulatedMatchActive
                  ? 'bg-cyan-400 text-slate-950 shadow-cyan-500/30 ring-2 ring-cyan-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {simulatedMatchActive ? 'Matching Target (Holding Pose...)' : 'Simulate Matching Target'}
            </button>
          </div>
        )}

        {/* Circular Ocean Water Ripple Hold Meter (Overlay) */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="rgba(15, 23, 42, 0.75)"
                strokeWidth="3.5"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={matchResult.isMatching ? '#38bdf8' : 'rgba(56, 189, 248, 0.25)'}
                strokeWidth="3.5"
                strokeDasharray="113.1"
                strokeDashoffset={113.1 * (1 - holdProgress)}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Inner Content: Hold Countdown or Check */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {holdProgress >= 1 ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 animate-scale" />
              ) : (
                <span className="text-xs font-mono font-semibold text-slate-200 tabular-nums">
                  {isHolding
                    ? `${Math.max(0.1, currentPose.holdDurationSeconds * (1 - holdProgress)).toFixed(1)}s`
                    : `${matchResult.accuracy}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Match Accuracy Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-xs font-medium text-slate-200 backdrop-blur-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              matchResult.isMatching ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-500'
            }`}
          />
          <span className="font-mono tabular-nums">{matchResult.accuracy}% Match</span>
        </div>

        {/* Real-time Guidance Banner (Bottom Center) */}
        <div className="absolute bottom-3 inset-x-3 z-30 pointer-events-none">
          <div className="mx-auto max-w-md px-4 py-2 rounded-xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-md text-center shadow-lg">
            <p className="text-xs font-medium text-cyan-200 truncate">
              {matchResult.coachingMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Viewport Control Bar */}
      <div className="px-4 py-3 bg-slate-900/70 border-t border-cyan-500/15 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGhostGuide((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              showGhostGuide
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-slate-200'
            }`}
            title="Toggle holographic water pose guide"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pose Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSkeleton((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              showSkeleton
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-slate-200'
            }`}
            title="Toggle skeleton tracking overlay"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Skeleton</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMirrored((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              isMirrored
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-slate-200'
            }`}
            title="Mirror camera"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Mirror</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDeskMode}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isDeskMode
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isDeskMode ? 'Desk / Seated' : 'Standing Flow'}
          </button>
        </div>
      </div>
    </div>
  );
};
