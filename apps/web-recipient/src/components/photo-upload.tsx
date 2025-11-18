'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, X, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
  existingPhotos?: string[]
  label?: string
  description?: string
}

export function PhotoUpload({
  onPhotosChange,
  maxPhotos = 5,
  existingPhotos = [],
  label = 'Photos',
  description = 'Ajoutez des photos pour documenter l\'anomalie',
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length)
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))

    const updatedPhotos = [...photos, ...newFiles]
    const updatedPreviews = [...previews, ...newPreviews]

    setPhotos(updatedPhotos)
    setPreviews(updatedPreviews)
    onPhotosChange(updatedPhotos)
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)

    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previews[index])

    setPhotos(updatedPhotos)
    setPreviews(updatedPreviews)
    onPhotosChange(updatedPhotos)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  const totalPhotos = photos.length + existingPhotos.length
  const canAddMore = totalPhotos < maxPhotos

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="label">{label}</label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Upload Buttons */}
      {canAddMore && (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={openCamera}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Prendre une photo</span>
          </button>

          <button
            type="button"
            onClick={openFileDialog}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>

          <span className="text-sm text-gray-500">
            {totalPhotos}/{maxPhotos} photos
          </span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Photo Previews */}
      {(previews.length > 0 || existingPhotos.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing Photos */}
          {existingPhotos.map((url, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded">
                  Existante
                </span>
              </div>
            </div>
          ))}

          {/* New Photos */}
          {previews.map((preview, index) => (
            <div key={`new-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary-500">
                <Image
                  src={preview}
                  alt={`Nouvelle photo ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-2 bg-danger-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 bg-success-600 text-white text-xs rounded">
                  Nouvelle
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {previews.length === 0 && existingPhotos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Aucune photo ajoutée</p>
          <p className="text-sm text-gray-500">
            Utilisez les boutons ci-dessus pour ajouter des photos
          </p>
        </div>
      )}
    </div>
  )
}
