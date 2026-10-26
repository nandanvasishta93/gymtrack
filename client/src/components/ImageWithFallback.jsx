import React, { useState, useEffect } from 'react';
import { Dumbbell, Play } from 'lucide-react';

export default function ImageWithFallback({ src, alt, className = "", muscle = "Body" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Muscle color mapping for fallback card
  const getGradientByMuscle = (m = "") => {
    const lower = m.toLowerCase();
    if (lower.includes('chest')) return 'from-cyan-900 to-blue-950 border-cyan-700/50';
    if (lower.includes('back')) return 'from-emerald-900 to-teal-950 border-emerald-700/50';
    if (lower.includes('quad') || lower.includes('hamstring') || lower.includes('glute')) return 'from-amber-900 to-orange-950 border-amber-700/50';
    if (lower.includes('shoulder')) return 'from-indigo-900 to-violet-950 border-indigo-700/50';
    if (lower.includes('tricep') || lower.includes('bicep') || lower.includes('arm')) return 'from-rose-900 to-pink-950 border-rose-700/50';
    if (lower.includes('abs') || lower.includes('core')) return 'from-purple-900 to-fuchsia-950 border-purple-700/50';
    return 'from-slate-800 to-slate-900 border-slate-700/50';
  };

  const isGif = src && src.endsWith('.gif');

  if (!src || hasError) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-3 bg-gradient-to-br ${getGradientByMuscle(muscle)} border rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Dumbbell className="w-28 h-28" />
        </div>
        <div className="p-2.5 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-xl mb-1.5 border border-white/10 shadow-inner">
          <Dumbbell className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90 text-center line-clamp-1">
          {muscle}
        </span>
        <span className="text-[11px] text-gray-200 font-semibold text-center line-clamp-1 mt-0.5 max-w-[90%]">
          {alt || "Exercise Demonstration"}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-950 rounded-2xl flex items-center justify-center border border-gray-800/60 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-10">
          <Dumbbell className="w-6 h-6 text-cyan-500 animate-bounce" />
        </div>
      )}
      <img
        src={src}
        alt={alt || "Exercise"}
        className={`w-full h-full object-contain bg-black/80 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      {isGif && isLoaded && (
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black uppercase text-cyan-400 border border-cyan-500/30 flex items-center gap-0.5 pointer-events-none">
          <Play className="w-2.5 h-2.5 fill-current" /> Rep Animation
        </span>
      )}
    </div>
  );
}
