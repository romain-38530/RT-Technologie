'use client'

import { useRef, useState, useEffect } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void
  onCancel: () => void
  signerName?: string
}

export function SignatureCanvas({ onSave, onCancel, signerName }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2 // High DPI
    canvas.height = rect.height * 2

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(2, 2)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setContext(ctx)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return

    setIsDrawing(true)
    setHasSignature(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (!context) return
    setIsDrawing(false)
    context.closePath()
  }

  const clear = () => {
    if (!context || !canvasRef.current) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHasSignature(false)
  }

  const save = () => {
    if (!canvasRef.current || !hasSignature) return
    const signatureData = canvasRef.current.toDataURL('image/png')
    onSave(signatureData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Signature du CMR</h3>
            {signerName && (
              <p className="text-sm text-gray-600 mt-1">
                Signataire: {signerName}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-6">
          <div className="border-2 border-gray-300 rounded-lg bg-gray-50 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-64 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-lg">
                  Signez ici
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Utilisez votre souris, stylet ou doigt pour signer dans la zone ci-dessus.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={clear}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={!hasSignature}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recommencer</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={save}
              disabled={!hasSignature}
              className="flex items-center space-x-2 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Valider la signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
