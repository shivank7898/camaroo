export type MessageStatus = "sending" | "sent" | "delivered" | "seen" | "failed";
export type ChatMessageType = "text" | "image" | "video" | "file" | "audio";
export type MessageType = ChatMessageType; // backwards compatibility

export interface ChatMessageMeta {
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  sizeInBytes?: number;
}

export interface ChatParticipant {
  _id: string;
  fullName: string;
  profilePicture?: string;
}

export interface LastMessage {
  content: string;
  senderId: string;
  createdAt: string;
  messageType: ChatMessageType;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: LastMessage;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  clientMessageId?: string;
  conversationId: string;
  content: string;
  messageType: ChatMessageType;
  senderId: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
  meta?: ChatMessageMeta;
}

// Map ChatMessage to GiftedChat UI shape
export interface GCMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status?: MessageStatus;
  pending?: boolean;
}

// API Responses
export interface ConversationsResponse {
  isSuccess: boolean;
  message?: string;
  statusCode?: number;
  data: {
    conversations: Conversation[];
  } | Conversation[];
}

export interface MessagesResponse {
  isSuccess: boolean;
  message?: string;
  statusCode?: number;
  data: {
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  } | ChatMessage[];
  hasMore?: boolean;
  nextCursor?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  clientMessageId: string;
  content?: string;
  messageType: ChatMessageType;
  senderId?: string;
  meta?: ChatMessageMeta;
}

export interface MarkSeenPayload {
  conversationId: string;
  messageId: string;
}

export interface TypingPayload {
  conversationId: string;
}
