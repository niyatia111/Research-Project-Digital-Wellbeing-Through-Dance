import { DancePose, LandmarkPoint, MatchResult } from '../types/dance';

// MediaPipe Pose Landmark Indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Calculates angle in degrees between three points B-A and B-C (with B as vertex).
 */
export function calculateAngle(
  a: LandmarkPoint,
  b: LandmarkPoint,
  c: LandmarkPoint
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Calculates angle of arm elevation relative to the spine/torso (pointing downward).
 * 0° = hanging down beside hip
 * 90° = horizontal T-pose
 * 180° = reaching straight up towards sky
 */
export function calculateArmElevation(
  shoulder: LandmarkPoint,
  elbow: LandmarkPoint,
  hip: LandmarkPoint
): number {
  // Vector torso (shoulder -> hip)
  const tx = hip.x - shoulder.x;
  const ty = hip.y - shoulder.y;
  // Vector upper arm (shoulder -> elbow)
  const ax = elbow.x - shoulder.x;
  const ay = elbow.y - shoulder.y;

  const dot = tx * ax + ty * ay;
  const magT = Math.sqrt(tx * tx + ty * ty);
  const magA = Math.sqrt(ax * ax + ay * ay);

  if (magT === 0 || magA === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magT * magA)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Evaluates user pose landmarks against target pose criteria.
 * Designed with high forgiveness and encouraging threshold for all skill levels.
 */
export function evaluatePoseMatch(
  landmarks: LandmarkPoint[],
  target: DancePose
): MatchResult {
  if (!landmarks || landmarks.length < 25) {
    return {
      accuracy: 0,
      isMatching: false,
      coachingMessage: 'Step back so your upper body and arms are in view',
      jointFeedback: { leftArm: 'neutral', rightArm: 'neutral', posture: 'neutral' },
    };
  }

  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const lWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  // In standard webcams with mirror display:
  // User's physical right arm appears on user's right side (mirrored)
  const lArmElev = calculateArmElevation(lShoulder, lElbow, lHip);
  const rArmElev = calculateArmElevation(rShoulder, rElbow, rHip);

  const lElbowAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rElbowAngle = calculateAngle(rShoulder, rElbow, rWrist);

  const criteria = target.criteria;
  let totalScore = 0;
  let checks = 0;

  let leftArmStatus: 'good' | 'adjust' | 'neutral' = 'neutral';
  let rightArmStatus: 'good' | 'adjust' | 'neutral' = 'neutral';
  let postureStatus: 'good' | 'adjust' | 'neutral' = 'good';

  // 1. Left arm elevation check
  if (criteria.leftArmElevationMin !== undefined && criteria.leftArmElevationMax !== undefined) {
    checks++;
    const targetMid = (criteria.leftArmElevationMin + criteria.leftArmElevationMax) / 2;
    const range = (criteria.leftArmElevationMax - criteria.leftArmElevationMin) / 2 + 30; // generous tolerance
    const diff = Math.abs(lArmElev - targetMid);
    const score = Math.max(0, 1 - diff / range);
    totalScore += score;
    leftArmStatus = score > 0.65 ? 'good' : 'adjust';
  }

  // 2. Right arm elevation check
  if (criteria.rightArmElevationMin !== undefined && criteria.rightArmElevationMax !== undefined) {
    checks++;
    const targetMid = (criteria.rightArmElevationMin + criteria.rightArmElevationMax) / 2;
    const range = (criteria.rightArmElevationMax - criteria.rightArmElevationMin) / 2 + 30;
    const diff = Math.abs(rArmElev - targetMid);
    const score = Math.max(0, 1 - diff / range);
    totalScore += score;
    rightArmStatus = score > 0.65 ? 'good' : 'adjust';
  }

  // 3. Elbow bend check
  if (criteria.leftElbowBend && criteria.leftElbowBend !== 'any') {
    checks++;
    if (criteria.leftElbowBend === 'straight') {
      const score = Math.max(0, Math.min(1, (lElbowAngle - 85) / 60));
      totalScore += score;
    } else {
      // bent
      const diff = Math.abs(lElbowAngle - 90);
      const score = Math.max(0, 1 - diff / 65);
      totalScore += score;
    }
  }

  if (criteria.rightElbowBend && criteria.rightElbowBend !== 'any') {
    checks++;
    if (criteria.rightElbowBend === 'straight') {
      const score = Math.max(0, Math.min(1, (rElbowAngle - 85) / 60));
      totalScore += score;
    } else {
      const diff = Math.abs(rElbowAngle - 90);
      const score = Math.max(0, 1 - diff / 65);
      totalScore += score;
    }
  }

  // 4. Hands overhead check
  if (criteria.handsOverhead) {
    checks++;
    const overheadL = lWrist.y < lShoulder.y;
    const overheadR = rWrist.y < rShoulder.y;
    const score = (overheadL ? 0.5 : 0) + (overheadR ? 0.5 : 0);
    totalScore += score;
  }

  // 5. Hands at chest check
  if (criteria.handsAtChest) {
    checks++;
    const chestL = lWrist.y > lShoulder.y && lWrist.y < lHip.y;
    const chestR = rWrist.y > rShoulder.y && rWrist.y < rHip.y;
    const closeTogether = Math.abs(lWrist.x - rWrist.x) < 0.25;
    const score = ((chestL ? 0.35 : 0) + (chestR ? 0.35 : 0) + (closeTogether ? 0.3 : 0));
    totalScore += score;
  }

  // 6. Torso sway check
  if (criteria.torsoSway && criteria.torsoSway !== 'any') {
    checks++;
    const midShoulderX = (lShoulder.x + rShoulder.x) / 2;
    const midHipX = (lHip.x + rHip.x) / 2;
    const deltaX = midShoulderX - midHipX;

    if (criteria.torsoSway === 'right') {
      totalScore += deltaX > -0.05 ? 1 : 0.6;
    } else if (criteria.torsoSway === 'left') {
      totalScore += deltaX < 0.05 ? 1 : 0.6;
    } else {
      totalScore += 0.9;
    }
  }

  const rawAccuracy = checks > 0 ? (totalScore / checks) * 100 : 80;
  // Boost base accuracy to make it welcoming and easy for all bodies
  const accuracy = Math.round(Math.min(100, Math.max(0, rawAccuracy * 1.08)));

  const isMatching = accuracy >= 64; // Welcoming threshold

  let coachingMessage = 'Flowing nicely with the ocean breath...';
  if (isMatching) {
    coachingMessage = 'Beautiful! Hold this serene posture...';
  } else if (leftArmStatus === 'adjust' && rightArmStatus === 'adjust') {
    coachingMessage = target.cue;
  } else if (leftArmStatus === 'adjust') {
    coachingMessage = 'Gently adjust your left arm to match the water guide';
  } else if (rightArmStatus === 'adjust') {
    coachingMessage = 'Gently adjust your right arm to match the water guide';
  }

  return {
    accuracy,
    isMatching,
    coachingMessage,
    jointFeedback: {
      leftArm: leftArmStatus,
      rightArm: rightArmStatus,
      posture: postureStatus,
    },
  };
}
