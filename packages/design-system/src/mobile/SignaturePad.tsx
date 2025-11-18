import * as React from 'react';
import { cn } from '../lib/utils';

export interface SignaturePadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  onSave?: (signature: string) => void;
  onClear?: () => void;
  onChange?: (isEmpty: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SignaturePad = React.forwardRef<HTMLDivElement, SignaturePadProps>(
  (
    {
      className,
      width = 600,
      height = 300,
      penColor = '#000000',
      penWidth = 2,
      backgroundColor = '#ffffff',
      onSave,
      onClear,
      onChange,
      disabled = false,
      placeholder = 'Signez ici',
      ...props
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [isEmpty, setIsEmpty] = React.useState(true);
    const [lastPosition, setLastPosition] = React.useState<{
      x: number;
      y: number;
    } | null>(null);

    // Initialiser le canvas
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Set pen style
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, [width, height, backgroundColor, penColor, penWidth]);

    const getCoordinates = (
      event: React.MouseEvent | React.TouchEvent
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      if ('touches' in event) {
        const touch = event.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      } else {
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      event.preventDefault();
      const coords = getCoordinates(event);
      if (!coords) return;

      setIsDrawing(true);
      setLastPosition(coords);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;

      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const coords = getCoordinates(event);
      if (!coords || !lastPosition) return;

      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      setLastPosition(coords);

      if (isEmpty) {
        setIsEmpty(false);
        onChange?.(false);
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      setLastPosition(null);
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      setIsEmpty(true);
      onChange?.(true);
      onClear?.();
    };

    const handleSave = () => {
      const canvas = canvasRef.current;
      if (!canvas || isEmpty) return;

      // Convertir en base64
      const signature = canvas.toDataURL('image/png');
      onSave?.(signature);
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Canvas de signature */}
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
          {isEmpty && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-lg">{placeholder}</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={cn(
              'block w-full h-auto touch-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            disabled={disabled || isEmpty}
            className="flex-1 min-h-[48px] py-3 px-6 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Effacer
          </button>
          <button
            onClick={handleSave}
            disabled={disabled || isEmpty}
            className="flex-1 min-h-[48px] py-3 px-6 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Valider
          </button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export { SignaturePad };
