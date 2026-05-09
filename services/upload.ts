import { apiRequest } from "./api"; // Ensure error handling matches
import BackgroundUpload from 'react-native-background-upload';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * persistFileForUpload
 * Copies a file from the temporary image-picker location to a persistent
 * documentDirectory path. This is required on iOS because NSURLSession
 * (used by react-native-background-upload) runs in a separate process and
 * cannot access temporary cache files.
 */
const persistFileForUpload = async (tempUri: string): Promise<string> => {
  const originalName = tempUri.split('/').pop() || 'upload';
  const ext = originalName.includes('.') ? `.${originalName.split('.').pop()}` : '';
  const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const destFile = new File(Paths.document, uniqueName);
  const srcFile = new File(tempUri);
  srcFile.copy(destFile);
  return destFile.uri;
};

/**
 * uploadFileTracked
 * Helper to upload a file to a pre-signed URL with precise progress tracking.
 * Uses XMLHttpRequest natively in React Native to easily bind to the upload stream events.
 */
export const uploadFileTracked = (
  fileUri: string,
  uploadUrl: string,
  contentType: string,
  onProgress?: (percentage: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    // Track upload progress precisely
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("File upload failed due to network error"));
    };

    // React native handles file:// URIs correctly when passed purely as an object to XHR body
    xhr.send({ uri: fileUri, type: contentType, name: fileUri.split('/').pop() } as any);
  });
};

/**
 * startPortfolioUpload
 * Uses react-native-background-upload to push a file to S3 transparently in the background.
 * The file is first copied to a persistent directory so that iOS's NSURLSession can access it.
 */
export const startPortfolioUpload = async (
  fileUri: string,
  uploadUrl: string,
  contentType: string
): Promise<string> => {
  // Copy to persistent storage so the background process can access the file
  const persistedUri = await persistFileForUpload(fileUri);
  
  // iOS REQUIRES the file:// prefix for NSURL(string:), otherwise it throws NSInvalidArgumentException
  // Android historically prefers the absolute path without file://
  let nativePath = persistedUri;
  if (Platform.OS === 'ios') {
    if (!nativePath.startsWith('file://')) {
      nativePath = `file://${nativePath}`;
    }
  } else {
    nativePath = nativePath.replace('file://', '');
  }

  const options = {
    url: uploadUrl,
    path: nativePath,
    method: 'PUT',

    type: 'raw',
    headers: {
      'Content-Type': contentType,
    },
    // Android foreground service notifications
    notification: {
      enabled: true,
      title: 'Portfolio Upload',
      body: 'Your post is being uploaded...',
      onProgressTitle: 'Uploading Post',
      onProgressBody: 'Progress: [[progress]]%',
      // Completion/error handled by usePortfolioListener via expo-notifications
      autoClear: true,
    },
  };

  // startUpload returns the upload ID tied to the native job
  return await BackgroundUpload.startUpload(options as any);
};

