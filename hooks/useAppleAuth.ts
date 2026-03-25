import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@store/authStore';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { socialSignInMutation } from '@services/mutations';
import { fetchMe } from '@services/queries';
import { useUserStore } from '@store/userStore';
import auth from '@react-native-firebase/auth';
import type { UserProfile, Subscription } from '@/types/auth';

interface MeResponse {
  user: UserProfile;
  subscription: Subscription | null;
}

export function useAppleAuth() {
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
      console.error('Apple Sign-In Error:', err);
    },
    onSettled: () => {
      setSigningIn(false);
    },
  });

  const signInWithApple = async () => {
    try {
      setSigningIn(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      // Firebase bridge
      const appleCredential = auth.AppleAuthProvider.credential(credential.identityToken);
      const firebaseUserCredential = await auth().signInWithCredential(appleCredential);
      const firebaseIdToken = await firebaseUserCredential.user.getIdToken();

      // Call backend (onSuccess handles the rest)
      await socialSignIn.mutateAsync({ idToken: firebaseIdToken, provider: 'apple' });
    } catch (e: unknown) {
      setSigningIn(false);
      const error = e as { code?: string; message?: string };
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-in.');
      } else if (!socialSignIn.isError) {
        console.error('Apple Sign-In Error:', e);
      }
    }
  };

  return {
    signInWithApple,
    loading: signingIn || socialSignIn.isPending,
    error: socialSignIn.error?.message || null,
  };
}
