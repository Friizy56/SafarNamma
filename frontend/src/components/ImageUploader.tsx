import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Plus, Check } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';

interface ImageUploaderProps {
  // Cover Photo
  coverUrl: string;
  onCoverChange: (url: string) => void;

  // Gallery Photos (3 to 5)
  galleryUrls: string[];
  onGalleryChange: (urls: string[]) => void;
  maxGalleryPhotos?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  coverUrl,
  onCoverChange,
  galleryUrls,
  onGalleryChange,
  maxGalleryPhotos = 5,
}) => {
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Handle Cover Upload
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingCover(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onCoverChange(url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Handle Gallery Uploads
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxGalleryPhotos - galleryUrls.length;
    if (remainingSlots <= 0) {
      setUploadError(`You can only upload up to ${maxGalleryPhotos} gallery photos.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setUploadError(null);
    setIsUploadingGallery(true);

    try {
      const uploadPromises = filesToUpload.map((f) => uploadImageToCloudinary(f));
      const uploadedUrls = await Promise.all(uploadPromises);
      onGalleryChange([...galleryUrls, ...uploadedUrls]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload one or more gallery images.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryPhoto = (indexToRemove: number) => {
    onGalleryChange(galleryUrls.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between animate-shake">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Primary Cover / Thumbnail */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Cover Thumbnail <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-gray-500">
          This is the primary photo shown on search cards and at the top of the place details page.
        </p>

        {coverUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-56 group shadow-sm">
            <img
              src={coverUrl}
              alt="Cover Thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-gray-100 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-[#1a4731]" /> Replace Photo
              </button>
              <button
                type="button"
                onClick={() => onCoverChange('')}
                className="bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow hover:bg-rose-600 transition-all flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Primary Cover
            </div>
          </div>
        ) : (
          <div
            onClick={() => !isUploadingCover && coverInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 hover:border-[#1a4731] hover:bg-[#faf9f6] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
              isUploadingCover ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
          >
            {isUploadingCover ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#1a4731] animate-spin" />
                <p className="text-sm font-semibold text-gray-700">Uploading cover image to Cloudinary...</p>
                <p className="text-xs text-gray-400">Optimizing photo for fast delivery</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1a4731] flex items-center justify-center mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-800">
                  Click to upload cover photo from your device
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, or WEBP up to 10MB
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverFileChange}
        />
      </div>

      {/* 2. Gallery Photos (3 to 5 Images) */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Showcase Gallery Photos (3 to 5 images)
            </label>
            <p className="text-xs text-gray-500">
              Upload rich views, angles, and highlights of this destination.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {galleryUrls.length} / {maxGalleryPhotos}
          </span>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {galleryUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group shadow-sm"
            >
              <img
                src={url}
                alt={`Gallery photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={() => handleRemoveGalleryPhoto(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white/90 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                #{index + 1}
              </span>
            </div>
          ))}

          {/* Add More Slot */}
          {galleryUrls.length < maxGalleryPhotos && (
            <button
              type="button"
              disabled={isUploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1a4731] hover:bg-emerald-50/40 text-gray-500 hover:text-[#1a4731] flex flex-col items-center justify-center gap-1.5 transition-all ${
                isUploadingGallery ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isUploadingGallery ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#1a4731]" />
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  <span className="text-xs font-semibold">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryFilesChange}
        />
      </div>
    </div>
  );
};
