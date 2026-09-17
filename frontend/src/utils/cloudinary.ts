/**
 * Cloudinary Client-Side Direct Upload Utility
 * Uploads media directly to Cloudinary CDN using an unsigned preset.
 */

const CLOUD_NAME = (
  import.meta.env.VITE_CLOUD_NAME ||
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  'my3tjiae'
).trim();

const UPLOAD_PRESET = (
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  'ml_default'
).trim();

/**
 * Upload a single image file directly to Cloudinary
 * @param file The image File object from an <input type="file" />
 * @returns The secure HTTPS CDN URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // 1. Validation
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image. Please select a valid photo (JPG, PNG, WEBP).`);
  }

  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`"${file.name}" is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
  }

  // 2. Prepare payload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  // 3. Send direct POST to Cloudinary endpoint
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Cloudinary upload error:', data);
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.');
  }

  return data.secure_url;
};

/**
 * Upload multiple image files concurrently
 * @param files Array of File objects
 * @returns Array of uploaded secure URLs
 */
export const uploadMultipleImagesToCloudinary = async (
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
  return await Promise.all(uploadPromises);
};
