'use client';

import { cn } from '@/app/_lib/utils';
import {
  Building,
  ClipboardList,
  MapPin,
  HardDrive,
  FileUp,
} from 'lucide-react';

const steps = [
  { name: 'Área', icon: Building, gradient: 'from-blue-500 to-indigo-600' },
  {
    name: 'Detalhes',
    icon: ClipboardList,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Localização',
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Equipamento',
    icon: HardDrive,
    gradient: 'from-amber-500 to-orange-600',
  },
  { name: 'Anexos', icon: FileUp, gradient: 'from-indigo-500 to-purple-600' },
];

interface FormStepperProps {
  currentStep: number; // (1 a 5)
}

export function FormStepper({ currentStep }: FormStepperProps) {
  return (
    <nav aria-label="Progresso do Formulário">
      <ol
        role="list"
        className="flex items-center justify-between space-x-2 md:space-x-4"
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step.name} className="relative flex-1">
              {/* Barra superior com glassmorphism */}
              <div
                className={cn(
                  'absolute top-0 right-0 left-0 h-1 rounded-full transition-all duration-500',
                  isCompleted || isCurrent
                    ? `bg-linear-to-r ${step.gradient} shadow-sm`
                    : 'bg-slate-200/60 dark:bg-slate-700/60',
                )}
              />

              <div className="flex flex-col items-center gap-2 pt-4 md:pt-5">
                {/* Ícone com glassmorphism */}
                <div className="relative">
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300',
                      isCompleted || isCurrent
                        ? `bg-linear-to-br ${step.gradient} shadow-lg backdrop-blur-xl`
                        : 'bg-linear-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-xl dark:from-slate-800/80 dark:to-slate-700/80',
                      isCurrent &&
                        'scale-110 ring-4 ring-white/30 dark:ring-slate-900/30',
                    )}
                  >
                    <step.icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isCompleted || isCurrent
                          ? 'text-white drop-shadow-sm'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                    />
                  </span>

                  {/* Glow effect para o item atual */}
                  {isCurrent && (
                    <div
                      className={cn(
                        'absolute -inset-1 rounded-2xl bg-linear-to-br opacity-20 blur-md',
                        step.gradient,
                      )}
                    />
                  )}

                  {/* Sombra colorida para items completados */}
                  {isCompleted && (
                    <div
                      className={cn(
                        'absolute -inset-0.5 rounded-2xl opacity-30 blur',
                        step.gradient,
                      )}
                      style={{
                        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'hidden text-xs font-semibold transition-colors md:block md:text-sm',
                    isCompleted || isCurrent
                      ? 'bg-linear-to-r bg-clip-text text-transparent ' +
                          step.gradient
                      : 'text-slate-500 dark:text-slate-400',
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
