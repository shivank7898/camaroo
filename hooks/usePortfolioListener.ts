import { useEffect, useRef } from 'react';
import BackgroundUpload from 'react-native-background-upload';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { useUploadStore } from '@store/uploadStore';
import { createPortfolioPostMutation } from '@services/mutations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePortfolioListener() {
  const activeUploads = useUploadStore(s => s.activeUploads);
  const updateProgress = useUploadStore(s => s.updateProgress);
  const updateStatus = useUploadStore(s => s.updateStatus);
  const removeUpload = useUploadStore(s => s.removeUpload);

  const listenersAttached = useRef<Set<string>>(new Set());

  useEffect(() => {
    Object.keys(activeUploads).forEach(uploadId => {
      if (listenersAttached.current.has(uploadId)) return;
      
      const upload = activeUploads[uploadId];
      if (upload.status === 'uploaded' || upload.status === 'saving') return;

      listenersAttached.current.add(uploadId);

      BackgroundUpload.addListener('progress', uploadId, (data) => {
        updateProgress(uploadId, data.progress);
      });

      BackgroundUpload.addListener('error', uploadId, (data) => {
        const errorMsg = typeof data.error === 'string' ? data.error : 'Upload failed';
        updateStatus(uploadId, 'failed', errorMsg);
        Toast.show({ type: 'error', text1: 'Upload failed', text2: upload.title });
        listenersAttached.current.delete(uploadId);
      });

      BackgroundUpload.addListener('cancelled', uploadId, () => {
        updateStatus(uploadId, 'failed', 'Upload cancelled');
        listenersAttached.current.delete(uploadId);
      });

      BackgroundUpload.addListener('completed', uploadId, async () => {
        updateStatus(uploadId, 'uploaded');
        
        try {
          updateStatus(uploadId, 'saving');
          await createPortfolioPostMutation({
            title: upload.title,
            description: upload.description,
            mediaUrls: {
              name: "portfolio-media",
              url: upload.fileUrl,
              mediaType: upload.mediaType
            },
            tags: upload.tags,
            visibility: upload.visibility
          });

          removeUpload(uploadId);
          listenersAttached.current.delete(uploadId);
          
          Toast.show({ type: 'success', text1: 'Upload Successful', text2: 'Your portfolio post is live!' });
          
          await Notifications.scheduleNotificationAsync({
            content: { title: "Upload Successful", body: "Your portfolio post is now live!" },
            trigger: null,
          });

        } catch (error: any) {
          updateStatus(uploadId, 'failed', error.message || 'Failed to save post');
          Toast.show({ type: 'error', text1: 'Post saving failed', text2: 'Tap retry in your profile.' });
        }
      });
    });
  }, [activeUploads]);

  // Expose manual retry for UI
  const retryFailedAPI = async (uploadId: string) => {
    const upload = activeUploads[uploadId];
    if (!upload || upload.status !== 'failed' || !upload.fileUrl) return;

    try {
      updateStatus(uploadId, 'saving');
      await createPortfolioPostMutation({
        title: upload.title,
        description: upload.description,
        mediaUrls: {
          name: "portfolio-media",
          url: upload.fileUrl,
          mediaType: upload.mediaType
        },
        tags: upload.tags,
        visibility: upload.visibility
      });

      removeUpload(uploadId);
      Toast.show({ type: 'success', text1: 'Upload Successful', text2: 'Your portfolio post is live!' });
    } catch (error: any) {
      updateStatus(uploadId, 'failed', error.message || 'Retry failed');
      Toast.show({ type: 'error', text1: 'Retry failed', text2: 'Please try again later' });
    }
  };

  return { retryFailedAPI };
}
