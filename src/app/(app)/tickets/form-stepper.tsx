'use client';

import { cn } from '@/app/_lib/utils';
import {
  Building,
  ClipboardList,
  MapPin,
  HardDrive,
  FileUp,
} from 'lucide-react';

// (Ajuste os ícones conforme a sua preferência)
const steps = [
  { name: 'Área', icon: Building },
  { name: 'Detalhes', icon: ClipboardList },
  { name: 'Localização', icon: MapPin },
  { name: 'Equipamento', icon: HardDrive },
  { name: 'Anexos', icon: FileUp },
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
            <li key={step.name} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center gap-2 border-t-4 pt-2 md:pt-4',
                  isCompleted ? 'border-primary' : 'border-border',
                  isCurrent && 'border-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                    isCurrent && 'ring-primary/20 ring-4',
                  )}
                >
                  <step.icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-primary',
                    !isCompleted && !isCurrent && 'text-muted-foreground',
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
