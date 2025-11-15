import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export default function InitialLoader() {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    { label: 'Inicializando sistema', duration: 350 },
    { label: 'Carregando dados', duration: 500 },
    { label: 'Autenticando usuário', duration: 300 },
    { label: 'Preparando interface', duration: 500 },
    { label: 'Quase pronto', duration: 350 },
  ];

  useEffect(() => {
    let currentStage = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 40); // 100 steps em 4 segundos

    const stageInterval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setLoadingStage(currentStage);
      } else {
        clearInterval(stageInterval);
      }
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -top-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-1/4 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-linear-to-r from-blue-500 to-purple-600 opacity-20 blur-xl" />
          <div className="relative rounded-3xl bg-linear-to-br from-blue-500 via-purple-600 to-pink-600 p-6 shadow-2xl">
            <Sparkles className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 bg-linear-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent">
          Sistema de Tickets
        </h1>
        <p className="mb-12 text-sm text-slate-400">
          Carregando sua experiência...
        </p>

        {/* Progress bar */}
        <div className="mb-8 w-full">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">
              Progresso
            </span>
            <span className="text-sm font-bold text-blue-400">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800/50 backdrop-blur-xl">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/50 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading stages */}
        <div className="w-full space-y-3">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 ${
                index < loadingStage
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : index === loadingStage
                    ? 'border-blue-500/30 bg-blue-500/10'
                    : 'border-slate-700/30 bg-slate-800/20'
              }`}
            >
              {index < loadingStage ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : index === loadingStage ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
              )}
              <span
                className={`flex-1 text-sm font-medium transition-colors ${
                  index <= loadingStage ? 'text-white' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
              {index < loadingStage && (
                <span className="text-xs text-emerald-400">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Loading spinner alternative - dots */}
        <div className="mt-8 flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-pink-500" />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-slate-500">
          © 2024 Sistema de Tickets. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
