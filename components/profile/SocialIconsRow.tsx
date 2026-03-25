import React, { useCallback } from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { Mail, Phone, Instagram, Youtube, Globe } from "lucide-react-native";

interface SocialIconsRowProps {
  email?: string;
  phone?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

/**
 * SocialIconsRow
 * Inline row of minimal tappable icons for contact and social links.
 * Only renders icons for props that are provided (non-empty).
 *
 * Props:
 *   email?     → opens mailto: link
 *   phone?     → opens tel: link
 *   instagram? → opens URL
 *   youtube?   → opens URL
 *   website?   → opens URL
 *
 * Functions:
 *   handleLink(url) → calls Linking.openURL(url)
 */
function SocialIconsRow({ email, phone, instagram, youtube, website }: SocialIconsRowProps) {
  /** handleLink — opens any URL via the system handler */
  const handleLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  return (
    <View className="flex-row items-center px-5 mt-4 gap-3">
      {email && (
        <TouchableOpacity
          onPress={() => handleLink(`mailto:${email}`)}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Send email"
        >
          <Mail size={17} color="#64748B" />
        </TouchableOpacity>
      )}
      {phone && (
        <TouchableOpacity
          onPress={() => handleLink(`tel:${phone}`)}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Call phone"
        >
          <Phone size={17} color="#64748B" />
        </TouchableOpacity>
      )}
      {instagram && (
        <TouchableOpacity
          onPress={() => handleLink(instagram)}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Open Instagram"
        >
          <Instagram size={17} color="#64748B" />
        </TouchableOpacity>
      )}
      {youtube && (
        <TouchableOpacity
          onPress={() => handleLink(youtube)}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Open YouTube"
        >
          <Youtube size={17} color="#64748B" />
        </TouchableOpacity>
      )}
      {website && (
        <TouchableOpacity
          onPress={() => handleLink(website)}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Open website"
        >
          <Globe size={17} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default React.memo(SocialIconsRow);
