import { useUploadStore } from '@store/uploadStore';
import { getUploadUrlMutation } from '@services/mutations';
import { startPortfolioUpload } from '@services/upload';

interface StartUploadParams {
  fileUri: string;
  mediaType: 'photo' | 'video';
  mimeType: string;
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
}

export function usePortfolioUpload() {
  const addUpload = useUploadStore((state) => state.addUpload);

  const startUpload = async (params: StartUploadParams) => {
    try {
      const fileName = params.fileUri.split('/').pop() || `upload.${params.mediaType === 'photo' ? 'jpg' : 'mp4'}`;
      
      // 1. Get pre-signed URL
      const response = await getUploadUrlMutation({
        mediaType: params.mediaType,
        fileName,
        contentType: params.mimeType,
      });

      if (!response?.uploadUrl || !response?.fileUrl) {
        throw new Error("Failed to get upload URL from server");
      }

      // 2. Start Native Background Upload
      const nativeJobId = await startPortfolioUpload(
        params.fileUri,
        response.uploadUrl,
        params.mimeType
      );

      // 3. Register in Persistent Store
      addUpload(nativeJobId, {
        fileUri: params.fileUri,
        fileUrl: response.fileUrl,
        title: params.title,
        description: params.description,
        tags: params.tags,
        visibility: params.visibility,
        mediaType: params.mediaType,
        mimeType: params.mimeType,
        uploadUrl: response.uploadUrl,
      });

      return nativeJobId;
    } catch (error) {
      console.error("Failed to start portfolio upload:", error);
      throw error;
    }
  };

  return { startUpload };
}
