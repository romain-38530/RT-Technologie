import React from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10
}) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max ${maxSizeMB}MB)`);
        return false;
      }
      return true;
    });

    const combined = [...files, ...validFiles].slice(0, maxFiles);
    onFilesChange(combined);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length < maxFiles && (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <Upload size={20} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            Joindre des fichiers ({files.length}/{maxFiles})
          </span>
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </label>
      )}
    </div>
  );
};
