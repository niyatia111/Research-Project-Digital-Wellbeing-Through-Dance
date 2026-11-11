import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { LandmarkPoint } from '../types/dance';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let isLoadingPromise: Promise<PoseLandmarker> | null = null;

export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  if (isLoadingPromise) {
    return isLoadingPromise;
  }

  isLoadingPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerInstance = landmarker;
      return landmarker;
    } catch (err) {
      console.warn('Failed with GPU delegate, attempting CPU fallback:', err);
      // Fallback with CPU delegate
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      poseLandmarkerInstance = landmarker;
      return landmarker;
    }
  })();

  return isLoadingPromise;
}

// MediaPipe connections for upper body & core
export const POSE_CONNECTIONS: [number, number][] = [
  // Face / head
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  // Shoulders & Chest
  [11, 12],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Torso
  [11, 23], [12, 24], [23, 24],
  // Legs (if visible)
  [23, 25], [24, 26], [25, 27], [26, 28],
];

/**
 * Draws the peaceful ethereal seafoam skeleton overlay on the canvas.
 */
export function drawOceanSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  isMatching: boolean,
  mirrored: boolean = true
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (mirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  // Choose luminous ocean palette
  const strokeColor = isMatching ? 'rgba(56, 189, 248, 0.85)' : 'rgba(147, 197, 253, 0.55)';
  const glowColor = isMatching ? 'rgba(34, 211, 238, 0.6)' : 'rgba(96, 165, 250, 0.3)';
  const jointFill = isMatching ? '#38bdf8' : '#93c5fd';

  // 1. Draw glowing bones / limbs
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isMatching ? 4.5 : 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = isMatching ? 16 : 8;

  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];

    if (!start || !end) continue;
    if ((start.visibility !== undefined && start.visibility < 0.4) ||
        (end.visibility !== undefined && end.visibility < 0.4)) {
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  // 2. Draw pearlescent joints
  ctx.shadowBlur = isMatching ? 12 : 6;
  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    if (!pt || (pt.visibility !== undefined && pt.visibility < 0.45)) continue;

    // Emphasize key arm & shoulder joints
    const isMajor = [11, 12, 13, 14, 15, 16].includes(i);
    const radius = isMajor ? (isMatching ? 6.5 : 5.5) : 3.5;

    ctx.beginPath();
    ctx.arc(pt.x * width, pt.y * height, radius, 0, 2 * Math.PI);
    ctx.fillStyle = jointFill;
    ctx.fill();

    // Inner pearl highlight
    ctx.beginPath();
    ctx.arc(pt.x * width, pt.y * height, radius * 0.45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  ctx.restore();
}
