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
  coverUri?: string;
  coverMimeType?: string;
}

export function usePortfolioUpload() {
  const addUpload = useUploadStore((state) => state.addUpload);

  const startUpload = async (params: StartUploadParams) => {
    try {
      const fileName = params.fileUri.split('/').pop() || `upload.${params.mediaType === 'photo' ? 'jpg' : 'mp4'}`;
      // API expects 'image' | 'video', not 'photo'
      const apiMediaType = params.mediaType === 'photo' ? 'image' : 'video';

      // 1. If video, handle Cover Upload synchronously in foreground
      let finalCoverUrl: string | undefined = undefined;

      if (params.mediaType === 'video' && params.coverUri) {
        const coverFileName = params.coverUri.split('/').pop() || 'cover.jpg';
        const coverRes = await getUploadUrlMutation({
          mediaType: 'image',
          fileName: coverFileName,
          contentType: params.coverMimeType || 'image/jpeg',
        });

        if (!coverRes?.uploadUrl || !coverRes?.fileUrl) {
          throw new Error("Failed to get cover upload URL");
        }

        const coverBlob = await (await fetch(params.coverUri)).blob();
        const uploadRes = await fetch(coverRes.uploadUrl, {
          method: 'PUT',
          body: coverBlob,
          headers: {
            'Content-Type': params.coverMimeType || 'image/jpeg',
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload cover photo");
        }
        
        finalCoverUrl = coverRes.fileUrl;
      }

      // 2. Get pre-signed URL for the main media (video or photo)
      const response = await getUploadUrlMutation({
        mediaType: apiMediaType,
        fileName,
        contentType: params.mimeType,
      });

      if (!response?.uploadUrl || !response?.fileUrl) {
        throw new Error("Failed to get upload URL from server");
      }

      // 3. Start Native Background Upload
      const nativeJobId = await startPortfolioUpload(
        params.fileUri,
        response.uploadUrl,
        params.mimeType
      );

      // 4. Register in Persistent Store
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
        coverUrl: finalCoverUrl,
      });

      return nativeJobId;
    } catch (error) {
      console.error("Failed to start portfolio upload:", error);
      throw error;
    }
  };

  return { startUpload };
}
