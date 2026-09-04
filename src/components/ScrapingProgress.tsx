import { useEffect, useState } from 'react';
import {
  Search,
  FileText,
  Filter,
  UserCheck,
  Database,
  Check,
  LoaderCircle,
} from 'lucide-react';

const steps = [
  { icon: Search, label: 'Searching LinkedIn', desc: 'Scanning hiring posts', delay: 0 },
  { icon: FileText, label: 'Extracting hiring posts', desc: 'Signals organized by role and company', delay: 2000 },
  { icon: Filter, label: 'Analyzing leads', desc: 'Qualification signals identified', delay: 4000 },
  { icon: UserCheck, label: 'Finding contact information', desc: 'Matching recruiters and work emails', delay: 6000 },
  { icon: Database, label: 'Generating lead profiles', desc: 'Building comprehensive profiles', delay: 8000 },
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
    <section className="surface p-5">
      <div className="flex justify-between">
        <h2 className="font-bold text-sm m-0 text-[var(--text-primary)]">Search Progress</h2>
        <span className="font-mono text-[10px] text-[var(--accent-mid)] font-bold">LIVE</span>
      </div>

      <div className="mt-6 ml-2 space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;
          const isPending = index > activeStep;

          return (
            <div
              key={step.label}
              className={`progress-item pl-5 pb-5 ${isCompleted ? 'complete' : ''} ${
                isPending ? 'opacity-50' : ''
              }`}
            >
              <span className="progress-dot">
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : isCurrent ? (
                  <LoaderCircle className="w-3 h-3 animate-spin text-[var(--accent-mid)]" />
                ) : null}
              </span>
              <p className={`text-sm font-semibold -mt-5 mb-1 ${
                isPending ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
              }`}>
                {step.label}
              </p>
              {!isPending && (
                <p className="text-xs text-[var(--text-secondary)] m-0">
                  {step.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
