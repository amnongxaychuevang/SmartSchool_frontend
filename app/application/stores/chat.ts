import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import { chatRepository, type ChatConversation, type ChatMessage, type ChatUser } from '../../infrastructure/api/ChatRepository';
import { useAuthStore } from './auth';

let socketInstance: Socket | null = null;

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ChatConversation[]>([]);
  const activeConversation = ref<ChatConversation | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const contacts = ref<ChatUser[]>([]);

  const loadingConversations = ref(false);
  const loadingMessages = ref(false);
  const loadingContacts = ref(false);
  const sendingMessage = ref(false);

  const typingState = ref<{ [conversationId: number]: { userName: string; isTyping: boolean } }>({});
  let typingTimeout: any = null;

  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  });

  function getSocket(): Socket {
    if (!socketInstance) {
      const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : (typeof window !== 'undefined' ? window.location.origin : '');

      socketInstance = io(backendUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      });

      socketInstance.on('connect', () => {
        const auth = useAuthStore();
        if (auth.user?.userId) {
          socketInstance?.emit('join:user', auth.user.userId);
        }
        if (activeConversation.value) {
          socketInstance?.emit('join:chat', activeConversation.value.conversationId);
        }
      });

      // New message in active or background conversation
      socketInstance.on('chat:new-message', (msg: ChatMessage) => {
        handleIncomingMessage(msg);
      });

      // Notification when message is received elsewhere
      socketInstance.on('chat:notification', (data: { conversationId: number; message: ChatMessage; senderName: string }) => {
        const auth = useAuthStore();
        if (msgIsForMe(data.message, auth.user?.userId)) {
          // If conversation is already active, incoming-message handled it. Otherwise, increment unread.
          if (!activeConversation.value || activeConversation.value.conversationId !== data.conversationId) {
            const conv = conversations.value.find((c) => c.conversationId === data.conversationId);
            if (conv) {
              conv.unreadCount = (conv.unreadCount || 0) + 1;
              conv.lastMessageAt = data.message.createdAt;
              sortConversations();
            } else {
              // Refresh full list if it's a completely new conversation
              fetchConversations();
            }
          }
        }
      });

      // Typing indicators
      socketInstance.on('chat:user-typing', (data: { conversationId: number; userId: number; userName: string; isTyping: boolean }) => {
        const auth = useAuthStore();
        if (data.userId !== auth.user?.userId) {
          typingState.value[data.conversationId] = {
            userName: data.userName,
            isTyping: data.isTyping,
          };
        }
      });

      // Read receipts
      socketInstance.on('chat:messages-read', (data: { conversationId: number; readBy: number }) => {
        if (activeConversation.value && activeConversation.value.conversationId === data.conversationId) {
          messages.value.forEach((m) => {
            if (m.senderId !== data.readBy) {
              m.isRead = true;
            }
          });
        }
      });
    }

    return socketInstance;
  }

  function msgIsForMe(msg: ChatMessage, myUserId?: number): boolean {
    return !!myUserId && msg.senderId !== myUserId;
  }

  function sortConversations() {
    conversations.value.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  function handleIncomingMessage(msg: ChatMessage) {
    const auth = useAuthStore();
    const myId = auth.user?.userId;

    // 1. If currently in the room
    if (activeConversation.value && activeConversation.value.conversationId === msg.conversationId) {
      const exists = messages.value.some((m) => m.messageId === msg.messageId);
      if (!exists) {
        messages.value.push(msg);
      }
      if (msg.senderId !== myId) {
        chatRepository.markAsRead(msg.conversationId).catch(() => {});
      }
    }

    // 2. Update conversation snippet in list
    const conv = conversations.value.find((c) => c.conversationId === msg.conversationId);
    if (conv) {
      conv.lastMessageAt = msg.createdAt;
      if (!conv.messages) conv.messages = [];
      conv.messages[0] = msg;

      if ((!activeConversation.value || activeConversation.value.conversationId !== msg.conversationId) && msg.senderId !== myId) {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }
      sortConversations();
    } else {
      fetchConversations();
    }
  }

  function initSocket() {
    const sock = getSocket();
    const auth = useAuthStore();
    if (auth.user?.userId && sock.connected) {
      sock.emit('join:user', auth.user.userId);
    }
  }

  async function fetchConversations() {
    loadingConversations.value = true;
    try {
      conversations.value = await chatRepository.listConversations();
      initSocket();
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      loadingConversations.value = false;
    }
  }

  async function selectConversation(conv: ChatConversation) {
    const sock = getSocket();
    if (activeConversation.value && activeConversation.value.conversationId !== conv.conversationId) {
      sock.emit('leave:chat', activeConversation.value.conversationId);
    }

    activeConversation.value = conv;
    conv.unreadCount = 0;
    sock.emit('join:chat', conv.conversationId);

    await fetchMessages(conv.conversationId);
    await chatRepository.markAsRead(conv.conversationId).catch(() => {});
  }

  async function fetchMessages(conversationId: number) {
    loadingMessages.value = true;
    try {
      const result = await chatRepository.getMessages(conversationId, 1, 100);
      messages.value = result.messages;
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      loadingMessages.value = false;
    }
  }

  async function sendMessage(content: string, attachmentUrl?: string) {
    if (!activeConversation.value || !content.trim()) return;
    const conversationId = activeConversation.value.conversationId;
    sendingMessage.value = true;

    try {
      const newMsg = await chatRepository.sendMessage(conversationId, content.trim(), attachmentUrl);
      const exists = messages.value.some((m) => m.messageId === newMsg.messageId);
      if (!exists) {
        messages.value.push(newMsg);
      }

      // Update snippet
      activeConversation.value.lastMessageAt = newMsg.createdAt;
      if (!activeConversation.value.messages) activeConversation.value.messages = [];
      activeConversation.value.messages[0] = newMsg;
      sortConversations();

      sendTyping(false);
      return newMsg;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      sendingMessage.value = false;
    }
  }

  function sendTyping(isTyping: boolean) {
    if (!activeConversation.value) return;
    const sock = getSocket();
    const auth = useAuthStore();
    const convId = activeConversation.value.conversationId;

    sock.emit('chat:typing', {
      conversationId: convId,
      userId: auth.user?.userId,
      userName: auth.user?.fullNameEn || 'User',
      isTyping,
    });

    if (isTyping) {
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        sock.emit('chat:typing', {
          conversationId: convId,
          userId: auth.user?.userId,
          userName: auth.user?.fullNameEn || 'User',
          isTyping: false,
        });
      }, 3000);
    }
  }

  async function fetchContacts() {
    loadingContacts.value = true;
    try {
      contacts.value = await chatRepository.getContacts();
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      loadingContacts.value = false;
    }
  }

  async function startConversationWith(targetUserId: number, studentId?: number) {
    try {
      const conv = await chatRepository.getOrCreateConversation(targetUserId, studentId);
      // Check if already in list
      const idx = conversations.value.findIndex((c) => c.conversationId === conv.conversationId);
      if (idx !== -1) {
        conversations.value[idx] = conv;
      } else {
        conversations.value.unshift(conv);
      }
      await selectConversation(conv);
      return conv;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      throw err;
    }
  }

  return {
    conversations,
    activeConversation,
    messages,
    contacts,
    loadingConversations,
    loadingMessages,
    loadingContacts,
    sendingMessage,
    typingState,
    totalUnreadCount,
    initSocket,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    sendTyping,
    fetchContacts,
    startConversationWith,
  };
});
