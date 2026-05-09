import { useEffect, useRef, useState } from "react";
import { getSocket } from "@services/socket";
import { useChatStore } from "@store/chatStore";
import { useAuthStore } from "@store/authStore";
import { getChatMessagesQuery } from "@services/queries";
import { getUploadUrlMutation } from "@services/mutations";
import { uploadFileTracked } from "@services/upload";
import type { ChatMessage, SendMessagePayload, ChatMessageType } from "@/types/chat";

export const useChatRoom = (conversationId: string) => {
  const {
    messages,
    typingUsers,
    pagination,
    setActiveConversation,
    setMessages,
    prependMessages,
    appendMessage,
    setPagination,
    replaceOptimisticMessage,
    updateMessageStatus,
  } = useChatStore();

  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roomMessages = messages[conversationId] || [];
  const roomPagination = pagination[conversationId] || { hasMore: false };
  const roomTypers = typingUsers[conversationId] || [];

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversation(conversationId);
    
    // Join room
    const socket = getSocket();
    socket.emit("socket-chat:conversation:join", { conversationId });

    // Initial load history API
    const loadHistory = async () => {
      try {
        const res = await getChatMessagesQuery(conversationId);
        const msgs = Array.isArray(res) 
          ? res 
          : (Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.messages || res?.data?.messages || []));
        setMessages(conversationId, msgs);
        setPagination(conversationId, res.nextCursor || res.data?.nextCursor, res.hasMore ?? res.data?.hasMore ?? false);
        setIsLoading(false);
        
        // Auto mark incoming as seen for freshly loaded messages
        if (user) {
          msgs.forEach((m: ChatMessage) => {
            if (m.senderId !== (user as any)._id && m.status !== "seen") {
              socket.emit("socket-chat:message:mark-seen", {
                conversationId,
                messageId: m._id,
              });
            }
          });
        }
      } catch (err: any) {
        if (err?.message?.includes("not found") || err?.message?.includes("conversation not found")) {
          console.log("[useChatRoom] Brand new chat room, naturally no history found.");
        } else {
          console.error("[useChatRoom] Failed to load history", err);
        }
        setIsLoading(false);
      }
    };
    loadHistory();

    // Cleanup
    return () => {
      socket.emit("socket-chat:conversation:leave", { conversationId });
      setActiveConversation(null);
      // keep messages cached to avoid blink on re-entry
    };
  }, [conversationId]);

  const loadOlderMessages = async () => {
    if (!roomPagination.hasMore || isPaginating || !roomPagination.cursor) return;
    
    setIsPaginating(true);
    try {
      const res = await getChatMessagesQuery(conversationId, roomPagination.cursor);
      const older = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.messages || res?.data?.messages || []));
      prependMessages(conversationId, older);
      setPagination(conversationId, res.nextCursor || res.data?.nextCursor, res.hasMore ?? res.data?.hasMore ?? false);
    } catch (err) {
      console.error("[useChatRoom] pagination fail", err);
    } finally {
      setIsPaginating(false);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !user) return;

    const socket = getSocket();
    const clientMessageId = `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMsg: ChatMessage = {
      _id: clientMessageId, // temporary until ack
      clientMessageId,
      conversationId,
      content: text,
      messageType: "text",
      senderId: user?.id || (user as any)?._id || "unknown",
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    // Immediate UI update
    appendMessage(conversationId, optimisticMsg);

    const payload: Omit<SendMessagePayload, 'senderId'> = {
      conversationId,
      clientMessageId,
      content: text,
      messageType: "text",
    };

    socket.emit("socket-chat:message:send", payload, (ack: any) => {
      if (ack?.success && ack?.data) {
        replaceOptimisticMessage(conversationId, clientMessageId, ack.data);
      } else {
        console.error("❌ Text Message ACK FAILED:", JSON.stringify(ack, null, 2));
        updateMessageStatus(conversationId, undefined, clientMessageId, "failed");
      }
    });

    // Also stop typing immediately
    stopTyping(true);
  };

  const sendMediaMessage = async (fileUri: string, mimeType: string, fileName: string, msgType: ChatMessageType = "image", textContent: string = "") => {
    if (!user) return;
    const socket = getSocket();
    const clientMessageId = `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMsg: ChatMessage = {
      _id: clientMessageId,
      clientMessageId,
      conversationId,
      content: textContent,
      messageType: msgType,
      senderId: user?.id || (user as any)?._id || "unknown",
      status: "sending",
      createdAt: new Date().toISOString(),
      meta: { mediaUrl: fileUri, fileName, mimeType },
    };

    // Immediate UI update (native local uri ensures instant preview)
    appendMessage(conversationId, optimisticMsg);

    try {
      const res = await getUploadUrlMutation({ 
        mediaType: msgType === "video" ? "video" : "image", 
        fileName, 
        contentType: mimeType 
      });
      if (!res?.uploadUrl) throw new Error("No upload URL returned.");
        
      await uploadFileTracked(fileUri, res.uploadUrl, mimeType);
      const finalUrl = res.fileUrl || res.uploadUrl.split("?")[0];

      const payload: Omit<SendMessagePayload, 'senderId'> = {
        conversationId,
        clientMessageId,
        content: textContent,
        messageType: msgType,
        meta: {
          mediaUrl: finalUrl,
          fileName,
          mimeType
        }
      };

      socket.emit("socket-chat:message:send", payload, (ack: any) => {
        if (ack?.success && ack?.data) {
          replaceOptimisticMessage(conversationId, clientMessageId, ack.data);
        } else {
          console.error("❌ Media Message ACK FAILED:", JSON.stringify(ack, null, 2));
          updateMessageStatus(conversationId, undefined, clientMessageId, "failed");
        }
      });
    } catch (e: any) {
      updateMessageStatus(conversationId, undefined, clientMessageId, "failed");
      console.error("[useChatRoom] Media Upload Failed:", e);
    }
  };

  const startTyping = () => {
    const socket = getSocket();
    socket.emit("socket-chat:typing:start", { conversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Auto stop after 1.5s
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  const stopTyping = (instant = false) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const socket = getSocket();
    socket.emit("socket-chat:typing:stop", { conversationId });
  };

  return {
    messages: roomMessages,
    isLoading,
    isPaginating,
    hasMore: roomPagination.hasMore,
    isTyping: roomTypers.length > 0,
    sendMessage,
    sendMediaMessage,
    loadOlderMessages,
    startTyping,
    stopTyping,
  };
};
