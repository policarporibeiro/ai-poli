import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle,
} from 'lucide-react';
import { WorkshopPhase, WorkshopPlan } from '../types/workshop';

interface LiveWorkshopRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkshopPlan;
}

export const LiveWorkshopRunner: React.FC<LiveWorkshopRunnerProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 min default
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<number | null>(null);

  const phases = plan.roteiro_passo_a_passo || [];
  const currentPhase: WorkshopPhase | undefined = phases[currentPhaseIndex];

  // Parse estimated minutes from duration string (e.g. "25 min", "30 minutos", "1 hora")
  const parseMinutes = (durationStr: string): number => {
    if (!durationStr) return 20;
    const match = durationStr.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (durationStr.toLowerCase().includes('hora') || durationStr.toLowerCase().includes('h')) {
        return num * 60;
      }
      return num;
    }
    return 20;
  };

  // When phase changes, reset timer
  useEffect(() => {
    if (currentPhase) {
      const minutes = parseMinutes(currentPhase.duracao_estimada);
      setTimeLeft(minutes * 60);
      setIsRunning(false);
    }
  }, [currentPhaseIndex, plan]);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) {
              playChime();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  // Clean Web Audio API synthesis
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio playback not supported:', e);
    }
  };

  if (!isOpen || !currentPhase) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    phases.length > 0 ? ((currentPhaseIndex + 1) / phases.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm no-print">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {/* Top bar with progress */}
        <div className="bg-stone-900 dark:bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Modo Condução ao Vivo • Ateliê
            </span>
            <h3 className="text-sm sm:text-base font-bold font-display truncate max-w-md">
              {plan.titulo_oficina}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Silenciar alarme' : 'Ativar alarme'}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div className="w-full bg-stone-800 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Phase Navigator */}
        <div className="bg-stone-100 dark:bg-stone-950/80 px-5 py-3 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 text-xs">
          <span className="font-semibold text-stone-600 dark:text-stone-300">
            Momento {currentPhaseIndex + 1} de {phases.length}
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              disabled={currentPhaseIndex === 0}
              onClick={() => setCurrentPhaseIndex((prev) => prev - 1)}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-stone-500 dark:text-stone-400 font-medium">Trocar Momento</span>
            <button
              disabled={currentPhaseIndex === phases.length - 1}
              onClick={() => setCurrentPhaseIndex((prev) => prev + 1)}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Phase Title & Duration */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/70 text-[#a3331b] dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {currentPhase.foco}
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-display">
              {currentPhase.fase}
            </h2>
          </div>

          {/* Large Countdown Timer */}
          <div className="bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col items-center justify-center space-y-4">
            <div className="font-mono text-5xl sm:text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              {formattedTime}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Meta estimada: {currentPhase.duracao_estimada}
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 text-white shadow-sm transition-all ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar Cronômetro</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  const m = parseMinutes(currentPhase.duracao_estimada);
                  setTimeLeft(m * 60);
                }}
                className="p-2.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors"
                title="Reiniciar tempo desta etapa"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description & Action Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              O que fazer nesta etapa:
            </h4>
            <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-stone-50 dark:bg-stone-950/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
              {currentPhase.descricao}
            </p>
          </div>

          {/* Mediation Tips Card */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dica de Mediação Ativa para o Educador:</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
              {currentPhase.dica_mediacao}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950/70 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            disabled={currentPhaseIndex === 0}
            onClick={() => setCurrentPhaseIndex((prev) => prev - 1)}
            className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40"
          >
            ← Momento Anterior
          </button>

          {currentPhaseIndex < phases.length - 1 ? (
            <button
              onClick={() => setCurrentPhaseIndex((prev) => prev + 1)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#e05638] hover:bg-[#c84325] rounded-xl shadow-xs transition-colors"
            >
              Próximo Momento →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir Oficina</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
