import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getUploadUrlMutation } from "@services/mutations";
import { uploadFileTracked } from "@services/upload";
import { pickMedia } from "@/utils/mediaPicker";
import * as ImagePicker from "expo-image-picker";

interface UseProfileImageUploadOptions {
  userId?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useProfileImageUpload(options?: UseProfileImageUploadOptions) {
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `profile-${options?.userId || Date.now()}.${fileExt}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      
      const uploadDetails = await getUploadUrlMutation({ mediaType: "image", fileName, contentType });
      
      if (uploadDetails?.uploadUrl) {
        await uploadFileTracked(uri, uploadDetails.uploadUrl, contentType, (percent) => {
          setUploadProgress(percent);
        });
        return uploadDetails.fileUrl || uploadDetails.uploadUrl.split("?")[0];
      }
      throw new Error("Failed to get upload URL");
    },
    onSuccess: (finalUrl) => {
      setUploadedUrl(finalUrl);
      setUploadProgress(0);
      options?.onSuccess?.(finalUrl);
    },
    onError: (err: Error) => {
      console.error("Upload failed", err);
      setImageError(err.message || "Failed to upload image");
      setUploadProgress(0);
      options?.onError?.(err);
    }
  });

  const handlePickImage = async () => {
    setImageError(null);
    const result = await pickMedia({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result) {
      setUploadProgress(0);
      setLocalImageUri(result.uri);
      uploadMutation.mutate(result.uri);
    }
  };

  return {
    localImageUri,
    setLocalImageUri,
    uploadedUrl,
    uploadProgress,
    imageError,
    setImageError,
    isUploading: uploadMutation.isPending,
    handlePickImage,
  };
}
