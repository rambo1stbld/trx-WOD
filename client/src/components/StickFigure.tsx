import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { AnimationKeyframe } from "@/lib/workoutData";

export type AvatarType = "panda" | "lion";

interface StickFigureProps {
  frames: AnimationKeyframe[];
  isPlaying: boolean;
  speed?: number;
  avatar?: AvatarType;
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
    straps:
      f1.straps && f2.straps
        ? {
            x1: interpolate(f1.straps.x1, f2.straps.x1, t),
            y1: interpolate(f1.straps.y1, f2.straps.y1, t),
            x2: interpolate(f1.straps.x2, f2.straps.x2, t),
            y2: interpolate(f1.straps.y2, f2.straps.y2, t),
          }
        : f1.straps,
    straps2:
      f1.straps2 && f2.straps2
        ? {
            x1: interpolate(f1.straps2.x1, f2.straps2.x1, t),
            y1: interpolate(f1.straps2.y1, f2.straps2.y1, t),
            x2: interpolate(f1.straps2.x2, f2.straps2.x2, t),
            y2: interpolate(f1.straps2.y2, f2.straps2.y2, t),
          }
        : f1.straps2,
    facingAway: f1.facingAway || f2.facingAway,
  };
}

function angleDeg(x1: number, y1: number, x2: number, y2: number): number {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/* ══════════════════════════════════════
   PANDA SVG PARTS
   ══════════════════════════════════════ */

function PandaHead({ cx, cy, angle, facingAway }: { cx: number; cy: number; angle: number; facingAway?: boolean }) {
  const r = 7.5;
  if (facingAway) {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
        <circle cx={-5} cy={-5.5} r={3.5} fill="#1a1a1a" />
        <circle cx={5} cy={-5.5} r={3.5} fill="#1a1a1a" />
        <circle cx={-5} cy={-5.5} r={2} fill="#222" />
        <circle cx={5} cy={-5.5} r={2} fill="#222" />
        <ellipse cx={0} cy={0} rx={r} ry={r * 0.92} fill="#e8e8e8" />
        <line x1={0} y1={-5} x2={0} y2={4} stroke="#d8d8d8" strokeWidth={0.6} strokeLinecap="round" />
        <ellipse cx={-4} cy={-1.5} rx={2} ry={2.5} fill="#ddd" opacity={0.5} />
        <ellipse cx={4} cy={-1.5} rx={2} ry={2.5} fill="#ddd" opacity={0.5} />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <circle cx={-5} cy={-5.5} r={3.5} fill="#1a1a1a" />
      <circle cx={5} cy={-5.5} r={3.5} fill="#1a1a1a" />
      <circle cx={-5} cy={-5.5} r={2} fill="#333" />
      <circle cx={5} cy={-5.5} r={2} fill="#333" />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.92} fill="#f0f0f0" />
      <ellipse cx={-2.8} cy={-1} rx={2.4} ry={2} fill="#1a1a1a" transform="rotate(-8, -2.8, -1)" />
      <ellipse cx={2.8} cy={-1} rx={2.4} ry={2} fill="#1a1a1a" transform="rotate(8, 2.8, -1)" />
      <circle cx={-2.8} cy={-1.2} r={1.1} fill="white" />
      <circle cx={2.8} cy={-1.2} r={1.1} fill="white" />
      <circle cx={-2.5} cy={-1.2} r={0.6} fill="#111" />
      <circle cx={3.1} cy={-1.2} r={0.6} fill="#111" />
      <circle cx={-2.2} cy={-1.6} r={0.25} fill="white" />
      <circle cx={3.4} cy={-1.6} r={0.25} fill="white" />
      <ellipse cx={0} cy={1.8} rx={1.6} ry={1.1} fill="#333" />
      <ellipse cx={0} cy={1.5} rx={0.8} ry={0.5} fill="#555" />
      <path d="M -1.2 3 Q 0 4.2, 1.2 3" fill="none" stroke="#333" strokeWidth={0.5} strokeLinecap="round" />
      <ellipse cx={-4.5} cy={1.5} rx={1.5} ry={0.8} fill="rgba(255,130,130,0.25)" />
      <ellipse cx={4.5} cy={1.5} rx={1.5} ry={0.8} fill="rgba(255,130,130,0.25)" />
    </g>
  );
}

function PandaBody({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = angleDeg(x1, y1, x2, y2);
  const length = dist(x1, y1, x2, y2);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g transform={`translate(${mx},${my}) rotate(${angle})`}>
      <ellipse cx={0} cy={0} rx={length / 2 + 1} ry={7.5} fill="#1a1a1a" />
      <ellipse cx={0} cy={0.5} rx={length / 2 - 0.5} ry={5.5} fill="#f0f0f0" />
      <ellipse cx={length * 0.1} cy={0.5} rx={4} ry={4} fill="#e8e8e8" opacity={0.5} />
    </g>
  );
}

function PandaLimb({ x1, y1, x2, y2, x3, y3 }: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth={5.5} strokeLinecap="round" />
      <line x1={x2} y1={y2} x2={x3} y2={y3} stroke="#1a1a1a" strokeWidth={5} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={3} fill="#222" />
      <circle cx={x3} cy={y3} r={3.2} fill="#1a1a1a" />
      <circle cx={x3} cy={y3} r={1.8} fill="#444" />
      <circle cx={x3 - 1.2} cy={y3 - 1.6} r={0.55} fill="#555" />
      <circle cx={x3 + 1.2} cy={y3 - 1.6} r={0.55} fill="#555" />
      <circle cx={x3} cy={y3 - 2} r={0.55} fill="#555" />
    </g>
  );
}

/* ══════════════════════════════════════
   LION SVG PARTS
   ══════════════════════════════════════ */

function LionHead({ cx, cy, angle, facingAway }: { cx: number; cy: number; angle: number; facingAway?: boolean }) {
  const r = 7.5;
  if (facingAway) {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
        {/* Mane from behind */}
        <circle cx={0} cy={0} r={r + 3.5} fill="#8B5E3C" />
        <circle cx={0} cy={0} r={r + 2} fill="#A0724D" />
        {/* Back of head */}
        <ellipse cx={0} cy={0} rx={r} ry={r * 0.92} fill="#D4A44C" />
        {/* Ears from behind */}
        <ellipse cx={-5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
        <ellipse cx={5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
        {/* Fur texture */}
        <line x1={0} y1={-4} x2={0} y2={3} stroke="#C49440" strokeWidth={0.5} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      {/* Mane — layered circles for volume */}
      <circle cx={0} cy={0} r={r + 3.5} fill="#8B5E3C" />
      <circle cx={-2} cy={-3} r={3} fill="#7A4F30" />
      <circle cx={2} cy={-3} r={3} fill="#7A4F30" />
      <circle cx={-4} cy={0} r={2.5} fill="#7A4F30" />
      <circle cx={4} cy={0} r={2.5} fill="#7A4F30" />
      <circle cx={0} cy={0} r={r + 2} fill="#A0724D" />

      {/* Head shape */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.92} fill="#D4A44C" />

      {/* Ears */}
      <ellipse cx={-5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
      <ellipse cx={5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
      <ellipse cx={-5.5} cy={-4} rx={1.5} ry={1.8} fill="#BA7535" />
      <ellipse cx={5.5} cy={-4} rx={1.5} ry={1.8} fill="#BA7535" />

      {/* Eyes */}
      <ellipse cx={-2.5} cy={-1.5} rx={1.4} ry={1.2} fill="white" />
      <ellipse cx={2.5} cy={-1.5} rx={1.4} ry={1.2} fill="white" />
      <circle cx={-2.3} cy={-1.5} r={0.7} fill="#4A2800" />
      <circle cx={2.7} cy={-1.5} r={0.7} fill="#4A2800" />
      {/* Eye highlights */}
      <circle cx={-2} cy={-1.9} r={0.3} fill="white" />
      <circle cx={3} cy={-1.9} r={0.3} fill="white" />

      {/* Muzzle */}
      <ellipse cx={0} cy={2} rx={3.5} ry={2.5} fill="#E8C87A" />

      {/* Nose */}
      <path d="M -1.2 1.2 L 0 0.4 L 1.2 1.2 Z" fill="#4A2800" />

      {/* Mouth */}
      <path d="M 0 1.8 L 0 2.8" stroke="#6B3A00" strokeWidth={0.5} strokeLinecap="round" />
      <path d="M -1.5 3.2 Q 0 3.8, 1.5 3.2" fill="none" stroke="#6B3A00" strokeWidth={0.5} strokeLinecap="round" />

      {/* Whisker dots */}
      <circle cx={-3.5} cy={2.5} r={0.3} fill="#B88A40" />
      <circle cx={-4} cy={3} r={0.3} fill="#B88A40" />
      <circle cx={3.5} cy={2.5} r={0.3} fill="#B88A40" />
      <circle cx={4} cy={3} r={0.3} fill="#B88A40" />
    </g>
  );
}

function LionBody({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = angleDeg(x1, y1, x2, y2);
  const length = dist(x1, y1, x2, y2);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g transform={`translate(${mx},${my}) rotate(${angle})`}>
      <ellipse cx={0} cy={0} rx={length / 2 + 1} ry={7.5} fill="#C49440" />
      <ellipse cx={0} cy={0.5} rx={length / 2 - 0.5} ry={5.5} fill="#D4A44C" />
      <ellipse cx={length * 0.12} cy={0.5} rx={4} ry={3.5} fill="#E0B85C" opacity={0.4} />
    </g>
  );
}

function LionLimb({ x1, y1, x2, y2, x3, y3 }: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B88A40" strokeWidth={5.5} strokeLinecap="round" />
      <line x1={x2} y1={y2} x2={x3} y2={y3} stroke="#B88A40" strokeWidth={5} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={3} fill="#A0724D" />
      {/* Paw */}
      <circle cx={x3} cy={y3} r={3.2} fill="#C49440" />
      <circle cx={x3} cy={y3} r={1.8} fill="#D4A44C" />
      {/* Claws */}
      <circle cx={x3 - 1.4} cy={y3 - 1.7} r={0.45} fill="#eee" />
      <circle cx={x3 + 1.4} cy={y3 - 1.7} r={0.45} fill="#eee" />
      <circle cx={x3} cy={y3 - 2.1} r={0.45} fill="#eee" />
    </g>
  );
}

/* ══════════════════════════════════════
   TRX STRAP (shared)
   ══════════════════════════════════════ */

function TRXStrap({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(30, 90%, 55%)"
        strokeWidth={1.8}
        strokeDasharray="4,2.5"
        opacity={0.75}
      />
      <rect
        x={x2 - 1.5} y={y2 - 1} width={3} height={2} rx={0.5}
        fill="hsl(30, 90%, 55%)" opacity={0.9}
        transform={`rotate(${angleDeg(x1, y1, x2, y2)}, ${x2}, ${y2})`}
      />
    </g>
  );
}

/* ══════════════════════════════════════
   AVATAR SELECTION FACES (exported for idle screen)
   ══════════════════════════════════════ */

export function PandaFace() {
  return (
    <svg viewBox="-15 -15 30 30" className="w-full h-full">
      <circle cx={-5} cy={-5.5} r={3.5} fill="#1a1a1a" />
      <circle cx={5} cy={-5.5} r={3.5} fill="#1a1a1a" />
      <circle cx={-5} cy={-5.5} r={2} fill="#333" />
      <circle cx={5} cy={-5.5} r={2} fill="#333" />
      <ellipse cx={0} cy={0} rx={7.5} ry={6.9} fill="#f0f0f0" />
      <ellipse cx={-2.8} cy={-1} rx={2.4} ry={2} fill="#1a1a1a" transform="rotate(-8, -2.8, -1)" />
      <ellipse cx={2.8} cy={-1} rx={2.4} ry={2} fill="#1a1a1a" transform="rotate(8, 2.8, -1)" />
      <circle cx={-2.8} cy={-1.2} r={1.1} fill="white" />
      <circle cx={2.8} cy={-1.2} r={1.1} fill="white" />
      <circle cx={-2.5} cy={-1.2} r={0.6} fill="#111" />
      <circle cx={3.1} cy={-1.2} r={0.6} fill="#111" />
      <circle cx={-2.2} cy={-1.6} r={0.25} fill="white" />
      <circle cx={3.4} cy={-1.6} r={0.25} fill="white" />
      <ellipse cx={0} cy={1.8} rx={1.6} ry={1.1} fill="#333" />
      <path d="M -1.2 3 Q 0 4.2, 1.2 3" fill="none" stroke="#333" strokeWidth={0.5} strokeLinecap="round" />
      <ellipse cx={-4.5} cy={1.5} rx={1.5} ry={0.8} fill="rgba(255,130,130,0.25)" />
      <ellipse cx={4.5} cy={1.5} rx={1.5} ry={0.8} fill="rgba(255,130,130,0.25)" />
    </svg>
  );
}

export function LionFace() {
  return (
    <svg viewBox="-18 -18 36 36" className="w-full h-full">
      <circle cx={0} cy={0} r={14} fill="#8B5E3C" />
      <circle cx={-2} cy={-3} r={4} fill="#7A4F30" />
      <circle cx={2} cy={-3} r={4} fill="#7A4F30" />
      <circle cx={0} cy={0} r={11.5} fill="#A0724D" />
      <ellipse cx={0} cy={0} rx={7.5} ry={6.9} fill="#D4A44C" />
      <ellipse cx={-5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
      <ellipse cx={5.5} cy={-4} rx={2.5} ry={2.8} fill="#C49440" />
      <ellipse cx={-5.5} cy={-4} rx={1.5} ry={1.8} fill="#BA7535" />
      <ellipse cx={5.5} cy={-4} rx={1.5} ry={1.8} fill="#BA7535" />
      <ellipse cx={-2.5} cy={-1.5} rx={1.4} ry={1.2} fill="white" />
      <ellipse cx={2.5} cy={-1.5} rx={1.4} ry={1.2} fill="white" />
      <circle cx={-2.3} cy={-1.5} r={0.7} fill="#4A2800" />
      <circle cx={2.7} cy={-1.5} r={0.7} fill="#4A2800" />
      <circle cx={-2} cy={-1.9} r={0.3} fill="white" />
      <circle cx={3} cy={-1.9} r={0.3} fill="white" />
      <ellipse cx={0} cy={2} rx={3.5} ry={2.5} fill="#E8C87A" />
      <path d="M -1.2 1.2 L 0 0.4 L 1.2 1.2 Z" fill="#4A2800" />
      <path d="M 0 1.8 L 0 2.8" stroke="#6B3A00" strokeWidth={0.5} strokeLinecap="round" />
      <path d="M -1.5 3.2 Q 0 3.8, 1.5 3.2" fill="none" stroke="#6B3A00" strokeWidth={0.5} strokeLinecap="round" />
      <circle cx={-3.5} cy={2.5} r={0.3} fill="#B88A40" />
      <circle cx={-4} cy={3} r={0.3} fill="#B88A40" />
      <circle cx={3.5} cy={2.5} r={0.3} fill="#B88A40" />
      <circle cx={4} cy={3} r={0.3} fill="#B88A40" />
    </svg>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

export default function StickFigure({
  frames,
  isPlaying,
  speed = 1200,
  avatar = "panda",
}: StickFigureProps) {
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
      const raw = (elapsed % (cycle * 2)) / cycle;
      const t = raw > 1 ? 2 - raw : raw;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(eased);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, frames, speed]);

  if (frames.length === 0) return null;

  const currentFrame = frames.length === 1
    ? frames[0]
    : interpolateFrame(frames[0], frames[1], progress);

  const torsoAngle = angleDeg(
    currentFrame.torso.x1, currentFrame.torso.y1,
    currentFrame.torso.x2, currentFrame.torso.y2
  );
  const headAngle = torsoAngle - 90;

  const isLion = avatar === "lion";
  const Head = isLion ? LionHead : PandaHead;
  const Body = isLion ? LionBody : PandaBody;
  const Limb = isLion ? LionLimb : PandaLimb;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full aspect-square max-w-[280px] mx-auto"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* TRX Anchor point */}
        <g>
          <rect x="46" y="0" width="8" height="3" rx="1" fill="#555" />
          <circle cx="50" cy="3" r="1.5" fill="#666" />
        </g>

        {/* TRX Straps */}
        {currentFrame.straps && (
          <TRXStrap x1={currentFrame.straps.x1} y1={currentFrame.straps.y1} x2={currentFrame.straps.x2} y2={currentFrame.straps.y2} />
        )}
        {currentFrame.straps2 && (
          <TRXStrap x1={currentFrame.straps2.x1} y1={currentFrame.straps2.y1} x2={currentFrame.straps2.x2} y2={currentFrame.straps2.y2} />
        )}

        {/* Legs */}
        <Limb x1={currentFrame.leftLeg.x1} y1={currentFrame.leftLeg.y1} x2={currentFrame.leftLeg.x2} y2={currentFrame.leftLeg.y2} x3={currentFrame.leftLeg.x3} y3={currentFrame.leftLeg.y3} />
        <Limb x1={currentFrame.rightLeg.x1} y1={currentFrame.rightLeg.y1} x2={currentFrame.rightLeg.x2} y2={currentFrame.rightLeg.y2} x3={currentFrame.rightLeg.x3} y3={currentFrame.rightLeg.y3} />

        {/* Body */}
        <Body x1={currentFrame.torso.x1} y1={currentFrame.torso.y1} x2={currentFrame.torso.x2} y2={currentFrame.torso.y2} />

        {/* Arms */}
        <Limb x1={currentFrame.leftArm.x1} y1={currentFrame.leftArm.y1} x2={currentFrame.leftArm.x2} y2={currentFrame.leftArm.y2} x3={currentFrame.leftArm.x3} y3={currentFrame.leftArm.y3} />
        <Limb x1={currentFrame.rightArm.x1} y1={currentFrame.rightArm.y1} x2={currentFrame.rightArm.x2} y2={currentFrame.rightArm.y2} x3={currentFrame.rightArm.x3} y3={currentFrame.rightArm.y3} />

        {/* Head */}
        <Head cx={currentFrame.head.x} cy={currentFrame.head.y} angle={headAngle} facingAway={currentFrame.facingAway} />

        {/* Ground */}
        <line x1="8" y1="96" x2="92" y2="96" stroke="hsl(var(--muted))" strokeWidth={0.5} opacity={0.2} />
      </svg>
    </motion.div>
  );
}
