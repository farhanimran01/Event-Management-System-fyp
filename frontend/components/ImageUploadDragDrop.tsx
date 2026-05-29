'use client';
import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

interface ImageUploadDragDropProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
  acceptedFormats?: string[];
}

export function ImageUploadDragDrop({
  onImagesSelected,
  maxImages = 4,
  maxSizePerImage = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ file: File; preview: string }>
  >([]);
  const [error, setError] = useState('');

  const validateFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setError('');

    // Check total count
    if (selectedImages.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return [];
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (!acceptedFormats.includes(file.type)) {
        setError(`Invalid format: ${file.name}. Allowed: JPEG, PNG, WebP`);
        continue;
      }

      if (file.size > maxSizePerImage * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizePerImage}MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages.map(img => img.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const updated = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updated);
    onImagesSelected(updated.map(img => img.file));
    URL.revokeObjectURL(selectedImages[index].preview);
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/20 bg-white/5 hover:border-white/30'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
        <p className="text-white font-semibold mb-1">
          Drag and drop images here
        </p>
        <p className="text-gray-400 text-sm mb-4">
          or click to browse (up to {maxImages} images, {maxSizePerImage}MB each)
        </p>

        <label>
          <input
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg cursor-pointer transition">
            Choose Images
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="mt-6">
          <p className="text-white font-semibold mb-3">
            Selected Images ({selectedImages.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-white/20 hover:border-cyan-400 transition"
              >
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Index Badge */}
                <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {selectedImages.length === maxImages && (
        <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          All {maxImages} images selected!
        </div>
      )}
    </div>
  );
}
