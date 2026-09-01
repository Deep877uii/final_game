import { useEffect, useState } from 'react';
import {
  Search,
  FileText,
  Filter,
  UserCheck,
  Database,
  CheckCircle,
} from 'lucide-react';

const steps = [
  { icon: Search, label: 'Searching LinkedIn', delay: 0 },
  { icon: FileText, label: 'Extracting hiring posts', delay: 2000 },
  { icon: Filter, label: 'Filtering relevant leads', delay: 4000 },
  { icon: UserCheck, label: 'Researching lead information', delay: 6000 },
  { icon: Database, label: 'Preparing outreach data', delay: 8000 },
];

interface ScrapingProgressProps {
  isActive: boolean;
}

export default function ScrapingProgress({ isActive }: ScrapingProgressProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setActiveStep(index);
      }, step.delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      setActiveStep(0);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="bi-widget p-6 sm:p-8">
      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-4 transition-all duration-500 ${
                index > activeStep ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div
                className={`
                  w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0
                  transition-all duration-500 border
                  ${
                    isCompleted
                      ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]'
                      : isCurrent
                      ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-[var(--color-primary)]'
                      : 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                )}
              </div>

              <span
                className={`text-sm font-semibold transition-colors duration-300 ${
                  isCompleted
                    ? 'text-[var(--color-success)]'
                    : isCurrent
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--text-tertiary)]'
                }`}
              >
                {step.label}
                {isCurrent && (
                  <span className="inline-flex ml-1.5">
                    <span className="animate-pulse">...</span>
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
