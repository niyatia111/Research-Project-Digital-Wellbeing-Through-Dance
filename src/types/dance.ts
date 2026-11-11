export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type FatigueFocus = 'neck' | 'shoulders' | 'spine' | 'wrists' | 'eyes' | 'breath';

export interface TargetPoseCriteria {
  // Required joint angles or height relationships
  leftArmElevationMin?: number; // degrees relative to torso down (0 = down, 90 = horizontal, 180 = straight up)
  leftArmElevationMax?: number;
  rightArmElevationMin?: number;
  rightArmElevationMax?: number;
  leftElbowBend?: 'straight' | 'bent' | 'any'; // straight ~ 140-180 deg, bent ~ 60-120 deg
  rightElbowBend?: 'straight' | 'bent' | 'any';
  armsCrossing?: boolean;
  handsOverhead?: boolean;
  handsAtChest?: boolean;
  torsoSway?: 'center' | 'left' | 'right' | 'any';
}

export interface DancePose {
  id: string;
  name: string;
  sanskritOrPoeticName: string;
  subtitle: string;
  fatigueBenefit: string;
  focusArea: FatigueFocus;
  breathPhase: 'Inhale & Expand' | 'Exhale & Soften' | 'Hold & Be Still' | 'Gentle Wave Breath';
  deskFriendly: boolean;
  holdDurationSeconds: number; // e.g. 2.5 or 3 seconds
  description: string;
  cue: string;
  criteria: TargetPoseCriteria;
  // Ideal 2D normalized coordinate points for the ghost/guide silhouette (0 to 1 normalized)
  guideKeypoints: {
    nose: [number, number];
    leftShoulder: [number, number];
    rightShoulder: [number, number];
    leftElbow: [number, number];
    rightElbow: [number, number];
    leftWrist: [number, number];
    rightWrist: [number, number];
    leftHip: [number, number];
    rightHip: [number, number];
  };
}

export interface MatchResult {
  accuracy: number; // 0 to 100
  isMatching: boolean; // meets minimum threshold (e.g. > 65%)
  coachingMessage: string;
  jointFeedback: {
    leftArm: 'good' | 'adjust' | 'neutral';
    rightArm: 'good' | 'adjust' | 'neutral';
    posture: 'good' | 'adjust' | 'neutral';
  };
}

export interface SessionMetrics {
  totalFlowsCompleted: number;
  posesCompleted: number;
  mindfulMinutes: number;
  breathsSynchronized: number;
  tensionRelievedTypes: Set<FatigueFocus>;
}
