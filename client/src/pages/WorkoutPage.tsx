import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, ChevronRight, Timer, Flame, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StickFigure from "@/components/StickFigure";
import { workoutPhases, type Exercise, type WorkoutPhase } from "@/lib/workoutData";

type WorkoutState = "idle" | "running" | "paused" | "rest" | "phaseTransition" | "complete";

interface TimerState {
  phaseIndex: number;
  roundIndex: number;
  exerciseIndex: number;
  timeRemaining: number;
  isRest: boolean;
  totalElapsed: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getTotalExercises(): number {
  return workoutPhases.reduce(
    (acc, phase) => acc + phase.exercises.length * phase.rounds,
    0
  );
}

function getPhaseColor(index: number): string {
  const colors = [
    "from-emerald-500/20 to-transparent",
    "from-orange-500/20 to-transparent",
    "from-blue-500/20 to-transparent",
    "from-purple-500/20 to-transparent",
    "from-red-500/20 to-transparent",
    "from-teal-500/20 to-transparent",
  ];
  return colors[index % colors.length];
}

function getPhaseAccent(index: number): string {
  const colors = [
    "text-emerald-400",
    "text-orange-400",
    "text-blue-400",
    "text-purple-400",
    "text-red-400",
    "text-teal-400",
  ];
  return colors[index % colors.length];
}

function getPhaseIcon(index: number) {
  if (index === 0) return Timer;
  if (index === 5) return Timer;
  return Flame;
}

export default function WorkoutPage() {
  const [workoutState, setWorkoutState] = useState<WorkoutState>("idle");
  const [timer, setTimer] = useState<TimerState>({
    phaseIndex: 0,
    roundIndex: 0,
    exerciseIndex: 0,
    timeRemaining: 0,
    isRest: false,
    totalElapsed: 0,
  });
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const currentPhase = workoutPhases[timer.phaseIndex];
  const currentExercise = currentPhase?.exercises[timer.exerciseIndex];

  const playBeep = useCallback((freq: number = 800, dur: number = 150) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
      osc.stop(ctx.currentTime + dur / 1000);
    } catch {
      // Audio not available
    }
  }, []);

  const advanceToNext = useCallback(() => {
    setTimer((prev) => {
      const phase = workoutPhases[prev.phaseIndex];
      if (!phase) return prev;

      // If currently in rest, move to next exercise
      if (prev.isRest) {
        const nextExIndex = prev.exerciseIndex + 1;

        // If we've done all exercises in this round
        if (nextExIndex >= phase.exercises.length) {
          const nextRound = prev.roundIndex + 1;

          // If we've done all rounds
          if (nextRound >= phase.rounds) {
            const nextPhase = prev.phaseIndex + 1;

            // If all phases done
            if (nextPhase >= workoutPhases.length) {
              setWorkoutState("complete");
              return prev;
            }

            // Move to next phase
            const np = workoutPhases[nextPhase];
            setWorkoutState("phaseTransition");
            return {
              ...prev,
              phaseIndex: nextPhase,
              roundIndex: 0,
              exerciseIndex: 0,
              timeRemaining: np.exercises[0]?.duration || np.workTime,
              isRest: false,
            };
          }

          // Start next round
          return {
            ...prev,
            roundIndex: nextRound,
            exerciseIndex: 0,
            timeRemaining: phase.workTime || phase.exercises[0].duration,
            isRest: false,
          };
        }

        return {
          ...prev,
          exerciseIndex: nextExIndex,
          timeRemaining: phase.workTime || phase.exercises[nextExIndex].duration,
          isRest: false,
        };
      }

      // Work period just ended
      setExercisesCompleted((c) => c + 1);

      // Cool-down: go straight to next exercise (no rest)
      if (phase.restTime === 0) {
        const nextExIndex = prev.exerciseIndex + 1;
        if (nextExIndex >= phase.exercises.length) {
          const nextPhase = prev.phaseIndex + 1;
          if (nextPhase >= workoutPhases.length) {
            setWorkoutState("complete");
            return prev;
          }
          const np = workoutPhases[nextPhase];
          return {
            ...prev,
            phaseIndex: nextPhase,
            roundIndex: 0,
            exerciseIndex: 0,
            timeRemaining: np.exercises[0]?.duration || np.workTime,
            isRest: false,
          };
        }
        return {
          ...prev,
          exerciseIndex: nextExIndex,
          timeRemaining: phase.exercises[nextExIndex].duration,
          isRest: false,
        };
      }

      // Start rest period
      return {
        ...prev,
        timeRemaining: phase.restTime,
        isRest: true,
      };
    });
  }, []);

  const tick = useCallback(() => {
    setTimer((prev) => {
      if (prev.timeRemaining <= 1) {
        playBeep(prev.isRest ? 1000 : 600);
        // Schedule advance on next tick
        setTimeout(() => advanceToNext(), 50);
        return { ...prev, timeRemaining: 0, totalElapsed: prev.totalElapsed + 1 };
      }

      if (prev.timeRemaining <= 4 && prev.timeRemaining > 1) {
        playBeep(500, 80);
      }

      return {
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
        totalElapsed: prev.totalElapsed + 1,
      };
    });
  }, [advanceToNext, playBeep]);

  useEffect(() => {
    if (workoutState === "running") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workoutState, tick]);

  // Auto-resume after phase transition
  useEffect(() => {
    if (workoutState === "phaseTransition") {
      const timeout = setTimeout(() => {
        setWorkoutState("running");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [workoutState]);

  const startWorkout = () => {
    const firstPhase = workoutPhases[0];
    setTimer({
      phaseIndex: 0,
      roundIndex: 0,
      exerciseIndex: 0,
      timeRemaining: firstPhase.exercises[0].duration,
      isRest: false,
      totalElapsed: 0,
    });
    setExercisesCompleted(0);
    setWorkoutState("running");
    playBeep(1200, 200);
  };

  const togglePause = () => {
    if (workoutState === "running") {
      setWorkoutState("paused");
    } else if (workoutState === "paused") {
      setWorkoutState("running");
    }
  };

  const skipExercise = () => {
    advanceToNext();
  };

  const resetWorkout = () => {
    setWorkoutState("idle");
    setExercisesCompleted(0);
    setTimer({
      phaseIndex: 0,
      roundIndex: 0,
      exerciseIndex: 0,
      timeRemaining: 0,
      isRest: false,
      totalElapsed: 0,
    });
  };

  const overallProgress = (exercisesCompleted / getTotalExercises()) * 100;

  // IDLE STATE — Show workout overview
  if (workoutState === "idle") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Dumbbell className="w-7 h-7 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">TRX WOD</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              50 minutes &middot; 24 exercises &middot; 6 phases
            </p>
          </motion.div>

          {/* Phase list */}
          <div className="space-y-3 mb-10">
            {workoutPhases.map((phase, i) => {
              const Icon = getPhaseIcon(i);
              return (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-card-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${getPhaseAccent(i)}`} />
                      <span className="font-semibold text-sm">{phase.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{phase.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.exercises.map((ex) => (
                      <span
                        key={ex.id}
                        className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded"
                      >
                        {ex.name.replace("TRX ", "")}
                      </span>
                    ))}
                  </div>
                  {phase.rounds > 1 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {phase.rounds} rounds &middot; {phase.workTime}s work / {phase.restTime}s rest
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Button
              onClick={startWorkout}
              size="lg"
              className="gap-2 px-10 py-6 text-base font-semibold rounded-xl"
              data-testid="button-start"
            >
              <Play className="w-5 h-5" />
              Start Workout
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // COMPLETE STATE
  if (workoutState === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Flame className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-xl font-bold mb-2">Workout Complete</h1>
          <p className="text-muted-foreground text-sm mb-2">
            {exercisesCompleted} exercises &middot; {formatTime(timer.totalElapsed)}
          </p>
          <p className="text-muted-foreground text-xs mb-8">
            Estimated {Math.round(timer.totalElapsed / 60 * 8)} kcal burned
          </p>
          <Button onClick={resetWorkout} size="lg" variant="outline" className="gap-2" data-testid="button-restart">
            <RotateCcw className="w-4 h-4" />
            Back to Overview
          </Button>
        </motion.div>
      </div>
    );
  }

  // ACTIVE WORKOUT STATE
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Phase gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getPhaseColor(timer.phaseIndex)} pointer-events-none`}
      />

      <div className="relative max-w-lg mx-auto px-4 py-6 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs font-medium ${getPhaseAccent(timer.phaseIndex)}`}>
              {currentPhase?.name}
            </p>
            {currentPhase && currentPhase.rounds > 1 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Round {timer.roundIndex + 1}/{currentPhase.rounds}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatTime(timer.totalElapsed)}</p>
            <p className="text-xs text-muted-foreground">{exercisesCompleted}/{getTotalExercises()}</p>
          </div>
        </div>

        {/* Overall progress */}
        <Progress value={overallProgress} className="h-1 mb-6" />

        {/* Phase transition overlay */}
        <AnimatePresence>
          {workoutState === "phaseTransition" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <ChevronRight className={`w-10 h-10 mx-auto mb-3 ${getPhaseAccent(timer.phaseIndex)}`} />
                <h2 className="text-lg font-bold mb-1">{currentPhase?.name}</h2>
                <p className="text-sm text-muted-foreground">Get ready...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          {/* Rest / Exercise indicator */}
          <AnimatePresence mode="wait">
            {timer.isRest ? (
              <motion.div
                key="rest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <p className="text-xs font-medium text-accent uppercase tracking-wider mb-4">Rest</p>
                <motion.div
                  className="text-6xl font-bold tabular-nums text-accent mb-4"
                  key={timer.timeRemaining}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {timer.timeRemaining}
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Up next: {currentPhase?.exercises[(timer.exerciseIndex + 1) % currentPhase.exercises.length]?.name.replace("TRX ", "")}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`exercise-${currentExercise?.id}-${timer.roundIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center w-full"
              >
                {/* Exercise name */}
                <h2 className="text-lg font-bold mb-1">{currentExercise?.name}</h2>
                <p className="text-xs text-muted-foreground mb-6">{currentExercise?.focus}</p>

                {/* Stick figure animation */}
                {currentExercise && (
                  <StickFigure
                    frames={currentExercise.animation}
                    isPlaying={workoutState === "running"}
                    speed={currentExercise.id === "plank" || currentExercise.focus === "Stretch" ? 2400 : 1200}
                  />
                )}

                {/* Timer */}
                <motion.div
                  className="text-5xl font-bold tabular-nums mt-4"
                  key={timer.timeRemaining}
                  initial={{ scale: timer.timeRemaining <= 3 ? 1.15 : 1.02, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    color: timer.timeRemaining <= 3 ? "hsl(0, 72%, 50%)" : "hsl(var(--foreground))",
                  }}
                >
                  {formatTime(timer.timeRemaining)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pb-6 pt-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={resetWorkout}
            data-testid="button-reset"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            className="w-16 h-16 rounded-full"
            onClick={togglePause}
            data-testid="button-pause"
          >
            {workoutState === "paused" ? (
              <Play className="w-7 h-7" />
            ) : (
              <Pause className="w-7 h-7" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={skipExercise}
            data-testid="button-skip"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Exercise queue */}
        {currentPhase && !timer.isRest && (
          <div className="pb-4">
            <div className="flex gap-1.5 justify-center">
              {currentPhase.exercises.map((ex, i) => (
                <div
                  key={`${ex.id}-${i}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i < timer.exerciseIndex
                      ? "bg-primary w-6"
                      : i === timer.exerciseIndex
                      ? "bg-primary w-10"
                      : "bg-muted w-6"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
