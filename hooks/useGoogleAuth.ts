import { useState } from 'react';
import { useRouter } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '@store/authStore';
import { useMutation } from '@tanstack/react-query';
import { socialSignInMutation } from '@services/mutations';
import { useUserStore } from '@store/userStore';
import auth from '@react-native-firebase/auth';
import type { UserProfile, Subscription } from '@/types/auth';

// Initialize Google Sign-in using the environment variable
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

interface MeResponse {
  user: UserProfile;
  subscription: Subscription | null;
}

export function useGoogleAuth() {
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUserData = useUserStore((s) => s.setUserData);

  const socialSignIn = useMutation({
    mutationFn: socialSignInMutation,
    onSuccess: async (data) => {
      if (!data) return;
      const { authToken, user: backendUser } = data;

      const userId = backendUser._id || backendUser.id || "";
      const fullName = backendUser.fullName || "";
      const email = backendUser.email || "";
      const role = backendUser.role || [];
      const profilePicture = backendUser.profilePicture;
      const isProfileCompleted = !!backendUser.isProfileCompleted;

      setAuth(
        {
          id: userId,
          name: fullName,
          email,
          category: role,
          profileImage: profilePicture,
          isProfileCompleted,
        },
        authToken
      );

      // Save to userStore directly from social login response
      setUserData({
        _id: userId,
        fullName,
        email,
        role,
        profilePicture,
        isProfileCompleted,
      });

      // Route based on isProfileCompleted
      if (backendUser.isProfileCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/role');
      }
    },
    onError: (err: Error) => {
      console.error('Social Sign-In Error:', err);
    },
    onSettled: () => {
      setSigningIn(false);
    },
  });

  const signInWithGoogle = async () => {
    try {
      setSigningIn(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Force account selection by clearing previous session
      try { await GoogleSignin.signOut(); } catch (_) {}

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken || (signInResult as Record<string, unknown>).idToken as string;

      if (!idToken) throw new Error('No ID token found');

      // Firebase bridge
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await firebaseUserCredential.user.getIdToken();

      // Call backend (onSuccess handles the rest)
      await socialSignIn.mutateAsync({ idToken: firebaseIdToken, provider: 'google' });
    } catch (err: unknown) {
      setSigningIn(false);
      if (!socialSignIn.isError) {
        console.error('Google Sign-In Error:', err);
      }
    }
  };

  return {
    signInWithGoogle,
    loading: signingIn || socialSignIn.isPending,
    error: socialSignIn.error?.message || null,
  };
}
