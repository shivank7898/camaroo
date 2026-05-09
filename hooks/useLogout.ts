import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import { useUploadStore } from '@store/uploadStore';
import { useUserStore } from '@store/userStore';
import { useRouter } from 'expo-router';

export function useLogout() {
  const queryClient = useQueryClient();
  const authLogout = useAuthStore((state) => state.logout);
  const clearUploads = useUploadStore((state) => state.clearAll);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    // 1. Wipe TanStack Network Cache (Security: Prevents data leaks across sessions)
    queryClient.clear();
    
    // 2. Wipe active background uploads
    clearUploads();

    // 3. Wipe Auth Session
    authLogout();
    clearUser();

    // 4. Force navigation to Login
    router.replace('/(auth)/login');
  };

  return { handleLogout };
}
