import React from 'react';
import { DancePose } from '../types/dance';

interface PoseGhostGuideProps {
  pose: DancePose;
  accuracy: number;
  isMatching: boolean;
  className?: string;
}

export const PoseGhostGuide: React.FC<PoseGhostGuideProps> = ({
  pose,
  isMatching,
  className = '',
}) => {
  const kp = pose.guideKeypoints;

  // Guide connections
  const lines: [keyof typeof kp, keyof typeof kp][] = [
    // Head to shoulders
    ['nose', 'leftShoulder'],
    ['nose', 'rightShoulder'],
    ['leftShoulder', 'rightShoulder'],
    // Left arm
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'leftWrist'],
    // Right arm
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    // Torso
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
  ];

  const strokeColor = isMatching ? '#38bdf8' : 'rgba(186, 230, 253, 0.45)';
  const glowColor = isMatching ? 'rgba(56, 189, 248, 0.8)' : 'rgba(125, 211, 252, 0.25)';

  return (
    <div className={`relative pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter transition-all duration-300"
        style={{
          filter: `drop-shadow(0 0 ${isMatching ? '10px' : '4px'} ${glowColor})`,
        }}
      >
        <defs>
          <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft Torso Silhouette Mesh */}
        <polygon
          points={`
            ${kp.leftShoulder[0] * 100},${kp.leftShoulder[1] * 100}
            ${kp.rightShoulder[0] * 100},${kp.rightShoulder[1] * 100}
            ${kp.rightHip[0] * 100},${kp.rightHip[1] * 100}
            ${kp.leftHip[0] * 100},${kp.leftHip[1] * 100}
          `}
          fill="url(#waterFlowGrad)"
          opacity={isMatching ? 0.35 : 0.18}
          className="transition-opacity duration-300"
        />

        {/* Head Aura */}
        <circle
          cx={kp.nose[0] * 100}
          cy={kp.nose[1] * 100}
          r="4.5"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeDasharray={isMatching ? 'none' : '2, 1.5'}
        />
        <circle
          cx={kp.nose[0] * 100}
          cy={kp.nose[1] * 100}
          r="1.5"
          fill="#ffffff"
          opacity={0.8}
        />

        {/* Skeletal Limb Connectors */}
        {lines.map(([from, to], i) => {
          const p1 = kp[from];
          const p2 = kp[to];
          return (
            <line
              key={i}
              x1={p1[0] * 100}
              y1={p1[1] * 100}
              x2={p2[0] * 100}
              y2={p2[1] * 100}
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={isMatching ? 'none' : '3, 2'}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Joint Points */}
        {Object.entries(kp).map(([name, [x, y]]) => {
          const isArmEnd = name === 'leftWrist' || name === 'rightWrist';
          return (
            <g key={name}>
              <circle
                cx={x * 100}
                cy={y * 100}
                r={isArmEnd ? 3.5 : 2.5}
                fill={isMatching ? '#38bdf8' : '#bae6fd'}
                opacity={0.9}
              />
              <circle
                cx={x * 100}
                cy={y * 100}
                r={isArmEnd ? 1.5 : 1}
                fill="#ffffff"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
