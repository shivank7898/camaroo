import { create } from "zustand";
import type { Conversation, ChatMessage, MessageStatus } from "@/types/chat";

interface ChatStore {
  // Converslist
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  upsertConversation: (c: Conversation) => void;

  // Active room
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Messages keyed by conversationId
  messages: Record<string, ChatMessage[]>;
  setMessages: (convId: string, msgs: ChatMessage[]) => void;
  appendMessage: (convId: string, msg: ChatMessage) => void;
  prependMessages: (convId: string, msgs: ChatMessage[]) => void;
  updateMessageStatus: (convId: string, msgId: string | undefined, clientMessageId: string | undefined, status: MessageStatus) => void;
  replaceOptimisticMessage: (convId: string, clientMessageId: string, real: ChatMessage) => void;

  // Typing state
  typingUsers: Record<string, string[]>;
  setTyping: (convId: string, userId: string, isTyping: boolean) => void;

  // Pagination cursor state
  pagination: Record<string, { cursor?: string; hasMore: boolean }>;
  setPagination: (convId: string, cursor?: string, hasMore?: boolean) => void;
  
  // Cleanup
  clearAll: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  setConversations: (c) => set({ conversations: c }),
  upsertConversation: (c) =>
    set((state) => {
      const idx = state.conversations.findIndex((x) => x._id === c._id);
      if (idx > -1) {
        const copy = [...state.conversations];
        copy[idx] = { ...copy[idx], ...c };
        // move to top if updatedAt changed
        copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return { conversations: copy };
      }
      return { conversations: [c, ...state.conversations] };
    }),

  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),

  messages: {},
  setMessages: (convId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [convId]: msgs } })),

  appendMessage: (convId, msg) =>
    set((state) => {
      const roomMsgs = state.messages[convId] || [];
      const existingIndex = roomMsgs.findIndex(
        (m) => (msg._id && m._id === msg._id) || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
      );
      
      if (existingIndex > -1) {
        const updated = [...roomMsgs];
        // Merge the incoming finalized message properties over the existing message
        updated[existingIndex] = { ...updated[existingIndex], ...msg };
        return { messages: { ...state.messages, [convId]: updated } };
      }
      
      // prepend since FlatList is inverted (index 0 is bottom = newest)
      return { messages: { ...state.messages, [convId]: [msg, ...roomMsgs] } };
    }),

  prependMessages: (convId, msgs) =>
    set((state) => {
      const roomMsgs = state.messages[convId] || [];
      // filter out duplicates
      const existingIds = new Set(roomMsgs.map((m) => m._id));
      const filtered = msgs.filter((m) => !existingIds.has(m._id));
      // append to end of list since inverted
      return { messages: { ...state.messages, [convId]: [...roomMsgs, ...filtered] } };
    }),

  updateMessageStatus: (convId, msgId, clientId, status) =>
    set((state) => {
      const roomMsgs = state.messages[convId] || [];
      const updated = roomMsgs.map((m) => {
        const isTarget = (!msgId && !clientId) 
                         || (msgId && m._id === msgId) 
                         || (clientId && m.clientMessageId === clientId);
        if (isTarget) {
          // If bulk updating, don't accidentally downgrade a "seen" message to "delivered", etc.
          // In standard chat logic: sending -> sent -> delivered -> seen.
          return { ...m, status };
        }
        return m;
      });
      return { messages: { ...state.messages, [convId]: updated } };
    }),

  replaceOptimisticMessage: (convId, clientMessageId, real) =>
    set((state) => {
      const roomMsgs = state.messages[convId] || [];
      const updated = roomMsgs.map((m) => {
        if (m.clientMessageId === clientMessageId) {
          // Merge old content so we don't lose text/date if ack payload is tiny
          return { ...m, ...real };
        }
        return m;
      });
      return { messages: { ...state.messages, [convId]: updated } };
    }),

  typingUsers: {},
  setTyping: (convId, userId, isTyping) =>
    set((state) => {
      const users = state.typingUsers[convId] || [];
      if (isTyping && !users.includes(userId)) {
        return { typingUsers: { ...state.typingUsers, [convId]: [...users, userId] } };
      }
      if (!isTyping && users.includes(userId)) {
        return { typingUsers: { ...state.typingUsers, [convId]: users.filter((u) => u !== userId) } };
      }
      return state;
    }),

  pagination: {},
  setPagination: (convId, cursor, hasMore = true) =>
    set((state) => ({
      pagination: { ...state.pagination, [convId]: { cursor, hasMore } },
    })),

  clearAll: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: {},
      typingUsers: {},
      pagination: {},
    }),
}));
