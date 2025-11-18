import * as React from 'react';
import { cn } from '../lib/utils';

export interface QRCodeDisplayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  size?: number;
  displayValue?: boolean;
  title?: string;
  subtitle?: string;
  onShare?: () => void;
  level?: 'L' | 'M' | 'Q' | 'H'; // Error correction level
}

const QRCodeDisplay = React.forwardRef<HTMLDivElement, QRCodeDisplayProps>(
  (
    {
      className,
      value,
      size = 256,
      displayValue = true,
      title,
      subtitle,
      onShare,
      level = 'M',
      ...props
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Fonction simplifiée pour générer un QR code
    // Note: Dans une vraie implémentation, utilisez qrcode.react ou une bibliothèque QR
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Placeholder: afficher un motif simple en attendant l'intégration d'une vraie lib QR
      canvas.width = size;
      canvas.height = size;

      // Background blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size, size);

      // Simuler un pattern QR (grille simple)
      ctx.fillStyle = '#000000';
      const cellSize = size / 25;

      // Coins caractéristiques du QR code
      // Coin haut-gauche
      ctx.fillRect(cellSize, cellSize, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cellSize * 2, cellSize * 2, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cellSize * 3, cellSize * 3, cellSize * 3, cellSize * 3);

      // Coin haut-droit
      ctx.fillRect(cellSize * 17, cellSize, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cellSize * 18, cellSize * 2, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cellSize * 19, cellSize * 3, cellSize * 3, cellSize * 3);

      // Coin bas-gauche
      ctx.fillRect(cellSize, cellSize * 17, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cellSize * 2, cellSize * 18, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cellSize * 3, cellSize * 19, cellSize * 3, cellSize * 3);

      // Pattern aléatoire au centre (simulation)
      for (let i = 8; i < 17; i++) {
        for (let j = 8; j < 17; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }

      // Note pour l'utilisateur dans la console
      console.info(
        'QRCodeDisplay: Pour une vraie génération QR, intégrez qrcode.react ou qrcode-generator'
      );
    }, [value, size, level]);

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center space-y-6 p-6', className)}
        {...props}
      >
        {/* Titre et sous-titre */}
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && (
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-base text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: size, height: size }}
          />
        </div>

        {/* Valeur affichée */}
        {displayValue && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Code :</p>
            <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">
              {value}
            </p>
          </div>
        )}

        {/* Bouton de partage */}
        {onShare && (
          <button
            onClick={onShare}
            className="min-h-[48px] py-3 px-8 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Partager
          </button>
        )}

        {/* Instructions */}
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-600 leading-relaxed">
            Demandez au destinataire de scanner ce QR code pour confirmer la
            réception.
          </p>
        </div>
      </div>
    );
  }
);

QRCodeDisplay.displayName = 'QRCodeDisplay';

export { QRCodeDisplay };
