import * as ImagePicker from "expo-image-picker";

interface PickMediaOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export const pickMedia = async (options: PickMediaOptions = {}) => {
  const defaultOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  const result = await ImagePicker.launchImageLibraryAsync({
    ...defaultOptions,
    ...options,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0];
  }

  return null;
};
