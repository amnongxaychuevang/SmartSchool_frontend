import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

export interface ChatUser {
  userId: number;
  fullNameEn: string;
  fullNameLo: string;
  avatarUrl: string | null;
  role?: string | { roleName: string };
  studentId?: number;
  studentName?: string;
  studentCode?: string;
}

export interface ChatMessage {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    userId: number;
    fullNameEn: string;
    fullNameLo: string;
    avatarUrl: string | null;
  };
}

export interface ChatConversation {
  conversationId: number;
  teacherId: number;
  parentId: number;
  studentId: number | null;
  lastMessageAt: string;
  unreadCount?: number;
  teacher: ChatUser;
  parent: ChatUser;
  student?: {
    studentId: number;
    studentCode: string;
    fullNameEn: string;
    fullNameLo: string;
    photoUrl: string | null;
  } | null;
  messages?: ChatMessage[];
}

export class ChatRepository {
  async listConversations(): Promise<ChatConversation[]> {
    const res = await useApiClient()<ApiResponse<{ conversations: ChatConversation[] }>>(
      API_ENDPOINTS.chat.conversations,
      { method: 'GET' }
    );
    return res.data?.conversations ?? [];
  }

  async getOrCreateConversation(targetUserId: number, studentId?: number): Promise<ChatConversation> {
    const res = await useApiClient()<ApiResponse<{ conversation: ChatConversation }>>(
      API_ENDPOINTS.chat.conversations,
      {
        method: 'POST',
        body: { targetUserId, studentId },
      }
    );
    return res.data!.conversation;
  }

  async getMessages(conversationId: number, page: number = 1, limit: number = 50): Promise<{
    messages: ChatMessage[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await useApiClient()<ApiResponse<{
      messages: ChatMessage[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>>(`${API_ENDPOINTS.chat.messages(conversationId)}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
    return res.data!;
  }

  async sendMessage(conversationId: number, content: string, attachmentUrl?: string): Promise<ChatMessage> {
    const res = await useApiClient()<ApiResponse<{ message: ChatMessage }>>(
      API_ENDPOINTS.chat.messages(conversationId),
      {
        method: 'POST',
        body: { content, attachmentUrl },
      }
    );
    return res.data!.message;
  }

  async markAsRead(conversationId: number): Promise<void> {
    await useApiClient()<ApiResponse<void>>(API_ENDPOINTS.chat.markRead(conversationId), {
      method: 'PUT',
    });
  }

  async getContacts(): Promise<ChatUser[]> {
    const res = await useApiClient()<ApiResponse<{ contacts: ChatUser[] }>>(
      API_ENDPOINTS.chat.contacts,
      { method: 'GET' }
    );
    return res.data?.contacts ?? [];
  }
}

export const chatRepository = new ChatRepository();
