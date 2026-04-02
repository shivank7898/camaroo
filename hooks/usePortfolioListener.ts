import { useEffect, useRef } from 'react';
import BackgroundUpload from 'react-native-background-upload';
import * as Notifications from 'expo-notifications';
import { useUploadStore } from '@store/uploadStore';
import { createPortfolioPostMutation } from '@services/mutations';
import type { QueryClient } from '@tanstack/react-query';
import type { NotificationContentInput } from 'expo-notifications';

// Suppress foreground alert — we rely solely on the scheduled notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const sendNotification = async (title: string, body: string) => {
  const content: NotificationContentInput = {
    title,
    body,
    sound: 'default',
    data: { screen: 'profile' },
  };

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: null,
  });
};

export function usePortfolioListener(queryClient: QueryClient) {
  const activeUploads = useUploadStore((state) => state.activeUploads);
  const updateProgress = useUploadStore(s => s.updateProgress);
  const updateStatus = useUploadStore(s => s.updateStatus);
  const removeUpload = useUploadStore(s => s.removeUpload);

  // Keep track of which ids have active native listeners
  const listenersAttached = useRef<Set<string>>(new Set());
  const notifiedUploads = useRef<Set<string>>(new Set());

  // Request notification permissions + create Android channel on mount
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      await Notifications.setNotificationChannelAsync('upload-status', {
        name: 'Upload Status',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    };
    setup();
  }, []);

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
        sendNotification('Upload Failed ❌', `"${upload.title}" failed to upload.`);
        listenersAttached.current.delete(uploadId);
      });

      BackgroundUpload.addListener('cancelled', uploadId, () => {
        updateStatus(uploadId, 'failed', 'Upload cancelled');
        listenersAttached.current.delete(uploadId);
      });

      BackgroundUpload.addListener('completed', uploadId, async () => {
        if (notifiedUploads.current.has(uploadId)) return;
        notifiedUploads.current.add(uploadId);

        updateStatus(uploadId, 'uploaded');

        try {
          updateStatus(uploadId, 'saving');
          await createPortfolioPostMutation({
            title: upload.title,
            description: upload.description,
            mediaUrls: {
              name: 'portfolio-media',
              url: upload.fileUrl,
              mediaType: upload.mediaType,
            },
            coverUrls: upload.mediaType === 'video' && upload.coverUrl
              ? { name: 'cover-image', url: upload.coverUrl, mediaType: 'photo' }
              : { name: 'cover-image', url: upload.fileUrl, mediaType: upload.mediaType },
            tags: upload.tags,
            visibility: upload.visibility,
          });

          removeUpload(uploadId);
          listenersAttached.current.delete(uploadId);
          queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });

          await sendNotification(
            'Upload Successful ✅',
            `"${upload.title}" is now live!`,
          );
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Failed to save post';
          updateStatus(uploadId, 'failed', msg);

          await sendNotification(
            'Upload Failed ❌',
            `"${upload.title}" could not be saved. Tap to retry.`,
          );
        }
      });
    });
  }, [activeUploads]);

  const retryFailedAPI = async (uploadId: string) => {
    const upload = activeUploads[uploadId];
    if (!upload || upload.status !== 'failed' || !upload.fileUrl) return;

    try {
      updateStatus(uploadId, 'saving');
      await createPortfolioPostMutation({
        title: upload.title,
        description: upload.description,
        mediaUrls: {
          name: 'portfolio-media',
          url: upload.fileUrl,
          mediaType: upload.mediaType,
        },
        coverUrls: upload.mediaType === 'video' && upload.coverUrl
          ? { name: 'cover-image', url: upload.coverUrl, mediaType: 'photo' }
          : { name: 'cover-image', url: upload.fileUrl, mediaType: upload.mediaType },
        tags: upload.tags,
        visibility: upload.visibility,
      });

      removeUpload(uploadId);
      queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
      await sendNotification('Upload Successful ✅', `"${upload.title}" is now live!`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Retry failed';
      updateStatus(uploadId, 'failed', msg);
      await sendNotification('Retry Failed ❌', 'Please try again later.');
    }
  };

  return { retryFailedAPI };
}
