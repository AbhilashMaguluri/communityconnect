// File handling utilities

// Validate file type
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']) => {
  return allowedTypes.includes(file.type.toLowerCase());
};

// Validate file size (in MB)
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Generate file preview URL
export const createFilePreview = (file) => {
  if (!file || !validateFileType(file)) {
    return null;
  }
  return URL.createObjectURL(file);
};

// Compress image file
export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (compressedFile) => {
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = createFilePreview(file);
  });
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique filename
export const generateUniqueFilename = (originalName) => {
  const extension = originalName.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomString}.${extension}`;
};

// Cleanup object URLs to prevent memory leaks
export const cleanupFilePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Create FormData for file upload
export const createFileFormData = (files, fieldName = 'images') => {
  const formData = new FormData();
  
  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append(fieldName, file);
    });
  } else if (files) {
    formData.append(fieldName, files);
  }
  
  return formData;
};