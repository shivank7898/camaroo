import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@services/socket";
import { useChatStore } from "@store/chatStore";
import { useAuthStore } from "@store/authStore";
import { getChatMessagesQuery } from "@services/queries";
import type { Conversation, ChatMessage, TypingPayload, MarkSeenPayload } from "@/types/chat";

export const useChatSocket = () => {
  const {
    upsertConversation,
    appendMessage,
    updateMessageStatus,
    setTyping,
    activeConversationId,
    setMessages,
    setPagination,
  } = useChatStore();

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    // --- Connection Events ---
    const onConnect = () => {
      console.log("[useChatSocket] Connected to server");
      // Recovery Flow: Re-join active room and reload messages
      const currentRoomId = useChatStore.getState().activeConversationId;
      if (currentRoomId) {
        socket.emit("socket-chat:conversation:join", { conversationId: currentRoomId });
        getChatMessagesQuery(currentRoomId)
          .then((res: any) => {
             const msgs = Array.isArray(res) 
               ? res 
               : (Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.messages || res?.data?.messages || []));
             setMessages(currentRoomId, msgs);
             setPagination(currentRoomId, res.nextCursor || res?.data?.nextCursor, res.hasMore ?? res?.data?.hasMore ?? false);
          })
          .catch(err => console.error("[useChatSocket] Recovery fetch failed:", err));
      }
    };

    const onDisconnect = () => console.log("[useChatSocket] Disconnected");

    // --- Chat Events ---
    const onReady = () => console.log("[useChatSocket] Ready");

    const onConversationUpdated = (payload: any) => {
      // Detailed logging as requested
      console.log("[useChatSocket] Raw Conversation Updated Event Received:", JSON.stringify(payload, null, 2));

      // Handle nested payloads if necessary
      const data = payload?.data || payload?.conversation || payload;
      if (!data || !data._id) return;
      
      console.log("[useChatSocket] Conversation Mapped Successfully:", data._id);
      upsertConversation(data);
    };

    const onMessageNew = (payload: any) => {
      // Handle potential nested structures
      const data: ChatMessage = payload?.message || payload?.data || payload;
      if (!data || (!data._id && !data.clientMessageId)) return;
      
      console.log("[useChatSocket] New message:", data._id || data.clientMessageId);
      const state = useChatStore.getState();
      
      // If it belongs to active room, append and auto-mark seen
      if (state.activeConversationId === data.conversationId) {
        appendMessage(data.conversationId, data);
        
        // Auto mark incoming as seen if we are in the room
        const currentUserId = useAuthStore.getState().user?.id || (useAuthStore.getState().user as any)?._id;
        if (data.senderId !== currentUserId) {
           socket.emit("socket-chat:message:mark-seen", {
             conversationId: data.conversationId,
             messageId: data._id
           } satisfies MarkSeenPayload);
        }
      } else {
        // Just rely on conversationUpdated to bump unread count in list
      }
    };

    const onMessageDelivered = (payload: any) => {
      const data = payload?.data || payload;
      if (data?.conversationId) {
        updateMessageStatus(data.conversationId, data.messageId, undefined, "delivered");
      }
    };

    const onMessageSeen = (payload: any) => {
      const data = payload?.data || payload;
      if (data?.conversationId) {
        updateMessageStatus(data.conversationId, data.messageId, undefined, "seen");
      }
    };

    const onTypingUpdate = (data: TypingPayload & { isTyping: boolean }) => {
      // Assuming payload has { conversationId, userId, isTyping }
      // the exact API wasn't detailed so handling typing update
      setTyping(data.conversationId, (data as any).userId || "unknown", data.isTyping);
    };

    // --- Bind ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("socket-chat:ready", onReady);
    socket.on("socket-chat:conversation:updated", onConversationUpdated);
    socket.on("socket-chat:message:new", onMessageNew);
    socket.on("socket-chat:message:delivered", onMessageDelivered);
    socket.on("socket-chat:message:seen", onMessageSeen);
    socket.on("socket-chat:typing:update", onTypingUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("socket-chat:ready", onReady);
      socket.off("socket-chat:conversation:updated", onConversationUpdated);
      socket.off("socket-chat:message:new", onMessageNew);
      socket.off("socket-chat:message:delivered", onMessageDelivered);
      socket.off("socket-chat:message:seen", onMessageSeen);
      socket.off("socket-chat:typing:update", onTypingUpdate);
    };
  }, [token, upsertConversation, appendMessage, updateMessageStatus, setTyping, setMessages, setPagination]);
};
