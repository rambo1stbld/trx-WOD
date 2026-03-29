import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { AnimationKeyframe } from "@/lib/workoutData";

interface StickFigureProps {
  frames: AnimationKeyframe[];
  isPlaying: boolean;
  speed?: number; // ms per frame cycle
}

function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateFrame(
  f1: AnimationKeyframe,
  f2: AnimationKeyframe,
  t: number
): AnimationKeyframe {
  return {
    label: t < 0.5 ? f1.label : f2.label,
    head: {
      x: interpolate(f1.head.x, f2.head.x, t),
      y: interpolate(f1.head.y, f2.head.y, t),
    },
    torso: {
      x1: interpolate(f1.torso.x1, f2.torso.x1, t),
      y1: interpolate(f1.torso.y1, f2.torso.y1, t),
      x2: interpolate(f1.torso.x2, f2.torso.x2, t),
      y2: interpolate(f1.torso.y2, f2.torso.y2, t),
    },
    leftArm: {
      x1: interpolate(f1.leftArm.x1, f2.leftArm.x1, t),
      y1: interpolate(f1.leftArm.y1, f2.leftArm.y1, t),
      x2: interpolate(f1.leftArm.x2, f2.leftArm.x2, t),
      y2: interpolate(f1.leftArm.y2, f2.leftArm.y2, t),
      x3: interpolate(f1.leftArm.x3, f2.leftArm.x3, t),
      y3: interpolate(f1.leftArm.y3, f2.leftArm.y3, t),
    },
    rightArm: {
      x1: interpolate(f1.rightArm.x1, f2.rightArm.x1, t),
      y1: interpolate(f1.rightArm.y1, f2.rightArm.y1, t),
      x2: interpolate(f1.rightArm.x2, f2.rightArm.x2, t),
      y2: interpolate(f1.rightArm.y2, f2.rightArm.y2, t),
      x3: interpolate(f1.rightArm.x3, f2.rightArm.x3, t),
      y3: interpolate(f1.rightArm.y3, f2.rightArm.y3, t),
    },
    leftLeg: {
      x1: interpolate(f1.leftLeg.x1, f2.leftLeg.x1, t),
      y1: interpolate(f1.leftLeg.y1, f2.leftLeg.y1, t),
      x2: interpolate(f1.leftLeg.x2, f2.leftLeg.x2, t),
      y2: interpolate(f1.leftLeg.y2, f2.leftLeg.y2, t),
      x3: interpolate(f1.leftLeg.x3, f2.leftLeg.x3, t),
      y3: interpolate(f1.leftLeg.y3, f2.leftLeg.y3, t),
    },
    rightLeg: {
      x1: interpolate(f1.rightLeg.x1, f2.rightLeg.x1, t),
      y1: interpolate(f1.rightLeg.y1, f2.rightLeg.y1, t),
      x2: interpolate(f1.rightLeg.x2, f2.rightLeg.x2, t),
      y2: interpolate(f1.rightLeg.y2, f2.rightLeg.y2, t),
      x3: interpolate(f1.rightLeg.x3, f2.rightLeg.x3, t),
      y3: interpolate(f1.rightLeg.y3, f2.rightLeg.y3, t),
    },
    straps: f1.straps && f2.straps ? {
      x1: interpolate(f1.straps.x1, f2.straps.x1, t),
      y1: interpolate(f1.straps.y1, f2.straps.y1, t),
      x2: interpolate(f1.straps.x2, f2.straps.x2, t),
      y2: interpolate(f1.straps.y2, f2.straps.y2, t),
    } : f1.straps,
    straps2: f1.straps2 && f2.straps2 ? {
      x1: interpolate(f1.straps2.x1, f2.straps2.x1, t),
      y1: interpolate(f1.straps2.y1, f2.straps2.y1, t),
      x2: interpolate(f1.straps2.x2, f2.straps2.x2, t),
      y2: interpolate(f1.straps2.y2, f2.straps2.y2, t),
    } : f1.straps2,
  };
}

export default function StickFigure({ frames, isPlaying, speed = 1200 }: StickFigureProps) {
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || frames.length < 2) {
      setProgress(0);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const cycle = speed;
      // Ping-pong: go 0→1→0→1...
      const raw = (elapsed % (cycle * 2)) / cycle;
      const t = raw > 1 ? 2 - raw : raw;
      // Apply easing
      const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(eased);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, frames, speed]);

  if (frames.length === 0) return null;

  const currentFrame = frames.length === 1
    ? frames[0]
    : interpolateFrame(frames[0], frames[1], progress);

  const bodyColor = "hsl(160, 84%, 44%)";
  const strapColor = "hsl(30, 90%, 55%)";
  const strokeWidth = 3;
  const headRadius = 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full aspect-square max-w-[280px] mx-auto"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* TRX Anchor point */}
        <circle cx="50" cy="2" r="3" fill="hsl(var(--muted))" opacity="0.6" />

        {/* TRX Straps */}
        {currentFrame.straps && (
          <line
            x1={currentFrame.straps.x1}
            y1={currentFrame.straps.y1}
            x2={currentFrame.straps.x2}
            y2={currentFrame.straps.y2}
            stroke={strapColor}
            strokeWidth={1.5}
            strokeDasharray="3,2"
            opacity={0.7}
          />
        )}
        {currentFrame.straps2 && (
          <line
            x1={currentFrame.straps2.x1}
            y1={currentFrame.straps2.y1}
            x2={currentFrame.straps2.x2}
            y2={currentFrame.straps2.y2}
            stroke={strapColor}
            strokeWidth={1.5}
            strokeDasharray="3,2"
            opacity={0.7}
          />
        )}

        {/* Strap handles */}
        {currentFrame.straps && (
          <circle
            cx={currentFrame.straps.x2}
            cy={currentFrame.straps.y2}
            r={2}
            fill={strapColor}
            opacity={0.8}
          />
        )}
        {currentFrame.straps2 && (
          <circle
            cx={currentFrame.straps2.x2}
            cy={currentFrame.straps2.y2}
            r={2}
            fill={strapColor}
            opacity={0.8}
          />
        )}

        {/* Torso */}
        <line
          x1={currentFrame.torso.x1}
          y1={currentFrame.torso.y1}
          x2={currentFrame.torso.x2}
          y2={currentFrame.torso.y2}
          stroke={bodyColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Left Arm (shoulder → elbow → hand) */}
        <polyline
          points={`${currentFrame.leftArm.x1},${currentFrame.leftArm.y1} ${currentFrame.leftArm.x2},${currentFrame.leftArm.y2} ${currentFrame.leftArm.x3},${currentFrame.leftArm.y3}`}
          fill="none"
          stroke={bodyColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Arm */}
        <polyline
          points={`${currentFrame.rightArm.x1},${currentFrame.rightArm.y1} ${currentFrame.rightArm.x2},${currentFrame.rightArm.y2} ${currentFrame.rightArm.x3},${currentFrame.rightArm.y3}`}
          fill="none"
          stroke={bodyColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left Leg */}
        <polyline
          points={`${currentFrame.leftLeg.x1},${currentFrame.leftLeg.y1} ${currentFrame.leftLeg.x2},${currentFrame.leftLeg.y2} ${currentFrame.leftLeg.x3},${currentFrame.leftLeg.y3}`}
          fill="none"
          stroke={bodyColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Leg */}
        <polyline
          points={`${currentFrame.rightLeg.x1},${currentFrame.rightLeg.y1} ${currentFrame.rightLeg.x2},${currentFrame.rightLeg.y2} ${currentFrame.rightLeg.x3},${currentFrame.rightLeg.y3}`}
          fill="none"
          stroke={bodyColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Head */}
        <circle
          cx={currentFrame.head.x}
          cy={currentFrame.head.y}
          r={headRadius}
          fill={bodyColor}
        />

        {/* Joints */}
        {[
          { x: currentFrame.leftArm.x2, y: currentFrame.leftArm.y2 },
          { x: currentFrame.rightArm.x2, y: currentFrame.rightArm.y2 },
          { x: currentFrame.leftLeg.x2, y: currentFrame.leftLeg.y2 },
          { x: currentFrame.rightLeg.x2, y: currentFrame.rightLeg.y2 },
          { x: currentFrame.torso.x2, y: currentFrame.torso.y2 },
        ].map((joint, i) => (
          <circle
            key={i}
            cx={joint.x}
            cy={joint.y}
            r={2}
            fill="hsl(160, 84%, 55%)"
            opacity={0.5}
          />
        ))}

        {/* Ground line */}
        <line
          x1="10"
          y1="95"
          x2="90"
          y2="95"
          stroke="hsl(var(--muted))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      </svg>
    </motion.div>
  );
}
