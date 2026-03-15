import { Image, View, ImageProps, ImageSourcePropType } from "react-native";

interface AvatarProps extends Omit<ImageProps, "source"> {
  source: ImageSourcePropType | { uri: string };
  size?: number;
  hasBorder?: boolean;
}

export function Avatar({ source, size = 48, hasBorder = false, className = "", ...props }: AvatarProps) {
  return (
    <View 
      className={`rounded-full overflow-hidden ${hasBorder ? "border-[2.5px] border-secondary" : ""} ${className}`}
      style={{ width: size, height: size, backgroundColor: '#0F1E30' }}
    >
      <Image 
        source={source} 
        style={{ width: "100%", height: "100%" }} 
        resizeMode="cover" 
        {...props} 
      />
    </View>
  );
}

