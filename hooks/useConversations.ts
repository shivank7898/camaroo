import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getChatConversationsQuery } from "@services/queries";
import { useChatStore } from "@store/chatStore";
import { useEffect } from "react";

export const useConversations = () => {
  const queryClient = useQueryClient();
  const { conversations, setConversations } = useChatStore();

  const { data: fetchedConversations, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const res = await getChatConversationsQuery();
      // Handle when the API returns { isSuccess: true, data: [...] }
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) ? res.data : (res?.conversations || res?.data?.conversations || []));
      return list;
    },
    staleTime: 0, 
  });

  // Pull query data into global store whenever it updates
  useEffect(() => {
    if (fetchedConversations) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, setConversations]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
  };

  return {
    conversations, // live from store
    isLoading,
    isError,
    isFetching,
    refresh,
  };
};
