import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WorkoutContext = createContext();

// Simple Web Audio API beep for rest timer completion
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log('Audio chime not allowed or supported yet');
  }
}

export function WorkoutProvider({ children }) {
  // Active workout duration timer
  const [workoutSeconds, setWorkoutSeconds] = useState(() => {
    return parseInt(localStorage.getItem('gym_active_workout_seconds') || '0', 10);
  });
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(false);

  // Rest Timer
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [initialRestDuration, setInitialRestDuration] = useState(90);

  const workoutTimerRef = useRef(null);
  const restTimerRef = useRef(null);

  // Workout Timer Effect
  useEffect(() => {
    if (isWorkoutTimerRunning) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem('gym_active_workout_seconds', next.toString());
          return next;
        });
      }, 1000);
    } else {
      clearInterval(workoutTimerRef.current);
    }
    return () => clearInterval(workoutTimerRef.current);
  }, [isWorkoutTimerRunning]);

  // Rest Timer Effect
  useEffect(() => {
    if (isRestActive && restSecondsLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            setIsRestActive(false);
            playChime();
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [isRestActive, restSecondsLeft]);

  const startWorkoutTimer = () => setIsWorkoutTimerRunning(true);
  const pauseWorkoutTimer = () => setIsWorkoutTimerRunning(false);
  const resetWorkoutTimer = () => {
    setIsWorkoutTimerRunning(false);
    setWorkoutSeconds(0);
    localStorage.removeItem('gym_active_workout_seconds');
  };

  const startRestTimer = (seconds = 90) => {
    setInitialRestDuration(seconds);
    setRestSecondsLeft(seconds);
    setIsRestActive(true);
  };

  const cancelRestTimer = () => {
    setIsRestActive(false);
    setRestSecondsLeft(0);
  };

  const adjustRestTime = (secondsDelta) => {
    setRestSecondsLeft(prev => Math.max(0, prev + secondsDelta));
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <WorkoutContext.Provider
      value={{
        workoutSeconds,
        isWorkoutTimerRunning,
        startWorkoutTimer,
        pauseWorkoutTimer,
        resetWorkoutTimer,
        restSecondsLeft,
        isRestActive,
        initialRestDuration,
        startRestTimer,
        cancelRestTimer,
        adjustRestTime,
        formatTime
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  return useContext(WorkoutContext);
}
