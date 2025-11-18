import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@rt/design-system';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // Sélecteur CSS de l'élément à highlight
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Action optionnelle à exécuter lors de cette étape
}

export interface TourGuideProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export const TourGuide: React.FC<TourGuideProps> = ({
  tourId,
  steps,
  onComplete,
  onSkip,
  autoStart = false,
}) => {
  const [isActive, setIsActive] = React.useState(autoStart);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  // Vérifier si le tour a déjà été complété
  React.useEffect(() => {
    const completedTours = JSON.parse(
      localStorage.getItem('rt-completed-tours') || '[]'
    );

    if (completedTours.includes(tourId)) {
      setIsActive(false);
    } else if (autoStart) {
      setIsActive(true);
    }
  }, [tourId, autoStart]);

  // Mettre à jour la position du tooltip quand l'étape change
  React.useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.target);

    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Exécuter l'action si elle existe
      if (step.action) {
        step.action();
      }

      // Scroll vers l'élément
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Marquer le tour comme complété
    const completedTours = JSON.parse(
      localStorage.getItem('rt-completed-tours') || '[]'
    );
    completedTours.push(tourId);
    localStorage.setItem('rt-completed-tours', JSON.stringify(completedTours));

    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip?.();
  };

  const getTooltipPosition = () => {
    if (!targetRect) return { top: 0, left: 0 };

    const step = steps[currentStep];
    const placement = step.placement || 'bottom';
    const offset = 16;

    switch (placement) {
      case 'top':
        return {
          top: targetRect.top - offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - offset,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + offset,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
    }
  };

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay avec spotlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: targetRect
                ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
                    targetRect.top + targetRect.height / 2
                  }px, transparent 0px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0, 0, 0, 0.5) ${Math.max(targetRect.width, targetRect.height) / 2 + 60}px)`
                : 'rgba(0, 0, 0, 0.5)',
            }}
            onClick={handleSkip}
          />

          {/* Highlight de l'élément ciblé */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                border: '3px solid #3b82f6',
                borderRadius: '8px',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[10000] bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm"
            style={{
              ...tooltipPosition,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Étape {currentStep + 1} sur {steps.length}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 mb-6">{step.content}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="sm"
              >
                Passer le tour
              </Button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Précédent
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="sm"
                  rightIcon={
                    currentStep < steps.length - 1 ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : undefined
                  }
                >
                  {currentStep < steps.length - 1 ? 'Suivant' : 'Terminer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TourGuide;
