<template>
  <div class="panel flex flex-col md:flex-row h-[calc(100vh-12rem)] min-h-[550px] max-h-[850px] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
    <!-- LEFT SIDE: Conversations & Contacts -->
    <div
      class="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
      :class="{ 'hidden md:flex': mobileChatOpen }"
    >
      <!-- Header -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{{ $t('chat.title') }}</span>
            <span
              v-if="chatStore.totalUnreadCount > 0"
              class="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse"
            >
              {{ chatStore.totalUnreadCount }}
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('chat.subtitle') }}</p>
        </div>
        <button
          type="button"
          class="btn-primary text-xs px-2.5 py-1.5 inline-flex items-center gap-1 rounded-lg"
          @click="showNewChatModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('chat.new_chat') }}
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            class="input-field text-xs pl-8 py-1.5 w-full bg-white dark:bg-slate-800"
            :placeholder="$t('chat.search_placeholder')"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        <LoadingSpinner v-if="chatStore.loadingConversations && !chatStore.conversations.length" class="py-12" />
        <div
          v-else-if="!filteredConversations.length"
          class="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2"
        >
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p>{{ searchQuery ? $t('common.empty') : $t('chat.no_conversations') }}</p>
          <button
            v-if="!searchQuery"
            type="button"
            class="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            @click="showNewChatModal = true"
          >
            {{ $t('chat.start_first_chat') }}
          </button>
        </div>

        <button
          v-for="conv in filteredConversations"
          :key="conv.conversationId"
          type="button"
          class="w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
          :class="{
            'bg-teal-50/70 dark:bg-teal-950/30 border-l-4 border-teal-500':
              chatStore.activeConversation?.conversationId === conv.conversationId,
          }"
          @click="openConversation(conv)"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
              <img
                v-if="getPartner(conv).avatarUrl"
                :src="getPartner(conv).avatarUrl!"
                class="w-full h-full object-cover"
                alt="Avatar"
              />
              <span v-else>{{ (getPartnerName(conv)[0] || 'U').toUpperCase() }}</span>
            </div>
            <!-- Online indicator -->
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {{ getPartnerName(conv) }}
              </h3>
              <span class="text-[10px] text-slate-400 whitespace-nowrap">
                {{ formatChatTime(conv.lastMessageAt) }}
              </span>
            </div>

            <!-- Student context if applicable -->
            <p v-if="conv.student" class="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate mb-0.5">
              🎒 {{ pick(conv.student.fullNameLo, conv.student.fullNameEn) }} ({{ conv.student.studentCode }})
            </p>

            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span v-if="chatStore.typingState[conv.conversationId]?.isTyping" class="text-teal-600 dark:text-teal-400 italic font-medium animate-pulse">
                  {{ $t('chat.is_typing') }}
                </span>
                <span v-else>
                  {{ conv.messages?.[0]?.content || $t('chat.started_chat') }}
                </span>
              </p>
              <span
                v-if="conv.unreadCount && conv.unreadCount > 0"
                class="px-1.5 py-0.5 text-[10px] font-bold text-white bg-teal-500 rounded-full shrink-0"
              >
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- RIGHT SIDE: Active Chat Room -->
    <div
      class="flex-1 flex flex-col bg-white dark:bg-slate-900 h-full overflow-hidden"
      :class="{ 'hidden md:flex': !mobileChatOpen }"
    >
      <template v-if="chatStore.activeConversation">
        <!-- Room Header -->
        <div class="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              @click="mobileChatOpen = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                <img
                  v-if="activePartner?.avatarUrl"
                  :src="activePartner.avatarUrl"
                  class="w-full h-full object-cover"
                  alt="Avatar"
                />
                <span v-else>{{ (activePartnerName[0] || 'U').toUpperCase() }}</span>
              </div>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {{ activePartnerName }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span class="inline-block px-1.5 py-0.2 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {{ isTeacher ? $t('chat.role_parent') : $t('chat.role_teacher') }}
                </span>
                <span v-if="chatStore.activeConversation.student" class="text-teal-600 dark:text-teal-400 font-medium text-[11px]">
                  🎒 {{ pick(chatStore.activeConversation.student.fullNameLo, chatStore.activeConversation.student.fullNameEn) }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {{ $t('chat.realtime_connected') }}
            </span>
          </div>
        </div>

        <!-- Messages Thread -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
          <LoadingSpinner v-if="chatStore.loadingMessages" class="py-12" />

          <div v-else-if="!chatStore.messages.length" class="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <div class="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ $t('chat.empty_thread_title') }}</p>
            <p class="text-xs text-slate-500 max-w-xs mt-1">{{ $t('chat.empty_thread_desc') }}</p>

            <!-- Quick Icebreakers -->
            <div class="flex flex-wrap gap-2 mt-4 justify-center">
              <button
                v-for="(phrase, idx) in icebreakers"
                :key="idx"
                type="button"
                class="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-all shadow-2xs"
                @click="sendIcebreaker(phrase)"
              >
                👋 {{ phrase }}
              </button>
            </div>
          </div>

          <!-- Message Bubbles -->
          <div
            v-for="(msg, index) in chatStore.messages"
            :key="msg.messageId || index"
            class="flex flex-col"
            :class="isMyMessage(msg) ? 'items-end' : 'items-start'"
          >
            <!-- Date header if needed -->
            <div
              v-if="shouldShowDateHeader(index)"
              class="self-center my-3 px-3 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400"
            >
              {{ formatDateSeparator(msg.createdAt) }}
            </div>

            <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
              <!-- Partner avatar (received messages) -->
              <div
                v-if="!isMyMessage(msg)"
                class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mb-1"
              >
                {{ (activePartnerName[0] || 'U').toUpperCase() }}
              </div>

              <!-- Bubble -->
              <div
                class="px-4 py-2.5 rounded-2xl shadow-2xs text-sm leading-relaxed"
                :class="
                  isMyMessage(msg)
                    ? 'bg-gradient-to-tr from-teal-600 to-teal-500 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                "
              >
                <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>

                <div
                  class="flex items-center justify-end gap-1 text-[10px] mt-1 select-none"
                  :class="isMyMessage(msg) ? 'text-teal-100' : 'text-slate-400'"
                >
                  <span>{{ formatMessageTime(msg.createdAt) }}</span>
                  <span v-if="isMyMessage(msg)" class="inline-flex">
                    <svg
                      v-if="msg.isRead"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 text-cyan-200"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 text-teal-200/70"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div
            v-if="chatStore.typingState[chatStore.activeConversation.conversationId]?.isTyping"
            class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic py-1 pl-9"
          >
            <span class="inline-flex gap-1 items-center px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 300ms" />
            </span>
            <span>{{ activePartnerName }} {{ $t('chat.is_typing') }}</span>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form class="flex items-end gap-2" @submit.prevent="handleSend">
            <div class="flex-1 relative rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-teal-500 bg-slate-50 dark:bg-slate-800 transition-colors">
              <textarea
                ref="textareaRef"
                v-model="inputContent"
                rows="1"
                class="w-full bg-transparent px-3.5 py-2.5 text-sm outline-none resize-none text-slate-800 dark:text-white placeholder-slate-400 max-h-32"
                :placeholder="$t('chat.input_placeholder')"
                @input="handleTyping"
                @keydown.enter.exact.prevent="handleSend"
              />
            </div>

            <button
              type="submit"
              class="btn-primary h-10 w-10 p-0 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              :disabled="!inputContent.trim() || chatStore.sendingMessage"
            >
              <svg
                v-if="!chatStore.sendingMessage"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transform rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </button>
          </form>
        </div>
      </template>

      <!-- Empty Selection State -->
      <div v-else class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
        <div class="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-700 dark:text-slate-200">{{ $t('chat.select_to_start') }}</h3>
        <p class="text-xs text-slate-500 max-w-sm mt-1">{{ $t('chat.select_to_start_desc') }}</p>
        <button
          type="button"
          class="btn-primary text-xs px-4 py-2 mt-4 rounded-xl inline-flex items-center gap-1.5"
          @click="showNewChatModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('chat.new_chat') }}
        </button>
      </div>
    </div>

    <!-- NEW CHAT MODAL -->
    <AppModal
      :open="showNewChatModal"
      :title="$t('chat.new_conversation')"
      size="md"
      @close="showNewChatModal = false"
    >
      <div class="flex flex-col gap-4">
        <p class="text-xs text-slate-500">
          {{ isTeacher ? $t('chat.select_parent_desc') : $t('chat.select_teacher_desc') }}
        </p>

        <div class="relative">
          <input
            v-model="contactSearch"
            type="text"
            class="input-field text-xs pl-8 py-2 w-full"
            :placeholder="$t('chat.search_contacts')"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <LoadingSpinner v-if="chatStore.loadingContacts" class="py-8" />
          <p v-else-if="!filteredContacts.length" class="text-center py-8 text-xs text-slate-400">
            {{ $t('common.empty') }}
          </p>

          <button
            v-for="contact in filteredContacts"
            :key="contact.userId"
            type="button"
            class="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            @click="startChatWithContact(contact)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden">
                <img v-if="contact.avatarUrl" :src="contact.avatarUrl" class="w-full h-full object-cover" alt="Avatar" />
                <span v-else>{{ (pick(contact.fullNameLo, contact.fullNameEn)[0] || 'U').toUpperCase() }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-white">
                  {{ pick(contact.fullNameLo, contact.fullNameEn) }}
                </p>
                <p v-if="contact.studentName" class="text-xs text-teal-600 dark:text-teal-400">
                  🎒 {{ $t('chat.student') }}: {{ contact.studentName }}
                </p>
                <p v-else class="text-xs text-slate-400">
                  {{ typeof contact.role === 'string' ? contact.role : contact.role?.roleName || '' }}
                </p>
              </div>
            </div>

            <span class="text-xs text-teal-600 dark:text-teal-400 font-medium">
              {{ $t('chat.chat_now') }} →
            </span>
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '../AppModal.vue';
import LoadingSpinner from '../LoadingSpinner.vue';
import { useChatStore } from '../../application/stores/chat';
import { useAuthStore } from '../../application/stores/auth';
import type { ChatConversation, ChatMessage, ChatUser } from '../../infrastructure/api/ChatRepository';

const { t, locale } = useI18n();
const chatStore = useChatStore();
const authStore = useAuthStore();

const isTeacher = computed(() => {
  const r = authStore.user?.role;
  const roleCode = typeof r === 'string' ? r : (r?.code || r?.portal || '');
  return roleCode.toLowerCase().includes('teacher');
});

const searchQuery = ref('');
const contactSearch = ref('');
const inputContent = ref('');
const showNewChatModal = ref(false);
const mobileChatOpen = ref(false);
const messagesContainer = ref<HTMLDivElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const icebreakers = computed(() => {
  if (locale.value === 'lo') {
    return isTeacher.value
      ? ['ສະບາຍດີຜູ້ປົກຄອງ', 'ແຈ້ງເລື່ອງການຮຽນຂອງນັກຮຽນ', 'ສະດວກລົມນຳກັນຈັກໜ້ອຍບໍ່?']
      : ['ສະບາຍດີອາຈານ', 'ຂໍສອບຖາມເລື່ອງວຽກບ້ານແດ່', 'ຂໍປຶກສາເລື່ອງລູກແດ່ຄູ'];
  }
  return isTeacher.value
    ? ['Hello, how can I help?', 'Sharing student progress update', 'Are you free for a quick chat?']
    : ['Hello teacher', 'Question about homework', 'Regarding my child'];
});

const pick = (lo?: string | null, en?: string | null) => {
  if (locale.value === 'lo') return lo || en || '';
  return en || lo || '';
};

const getPartner = (conv: ChatConversation) => {
  const myId = authStore.user?.userId;
  return conv.teacherId === myId ? conv.parent : conv.teacher;
};

const getPartnerName = (conv: ChatConversation) => {
  const p = getPartner(conv);
  return pick(p?.fullNameLo, p?.fullNameEn);
};

const activePartner = computed(() => {
  if (!chatStore.activeConversation) return null;
  return getPartner(chatStore.activeConversation);
});

const activePartnerName = computed(() => {
  if (!chatStore.activeConversation) return '';
  return getPartnerName(chatStore.activeConversation);
});

const isMyMessage = (msg: ChatMessage) => {
  return msg.senderId === authStore.user?.userId;
};

const filteredConversations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return chatStore.conversations;
  return chatStore.conversations.filter((c) => {
    const name = getPartnerName(c).toLowerCase();
    const student = c.student ? (c.student.fullNameEn + ' ' + c.student.fullNameLo).toLowerCase() : '';
    return name.includes(q) || student.includes(q);
  });
});

const filteredContacts = computed(() => {
  const q = contactSearch.value.trim().toLowerCase();
  if (!q) return chatStore.contacts;
  return chatStore.contacts.filter((c) => {
    const name = pick(c.fullNameLo, c.fullNameEn).toLowerCase();
    const student = c.studentName?.toLowerCase() || '';
    return name.includes(q) || student.includes(q);
  });
});

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom();
  }
);

function openConversation(conv: ChatConversation) {
  chatStore.selectConversation(conv);
  mobileChatOpen.value = true;
  scrollToBottom();
}

function handleTyping() {
  chatStore.sendTyping(true);
}

async function handleSend() {
  const content = inputContent.value.trim();
  if (!content) return;
  inputContent.value = '';
  await chatStore.sendMessage(content);
  scrollToBottom();
}

async function sendIcebreaker(text: string) {
  await chatStore.sendMessage(text);
  scrollToBottom();
}

async function startChatWithContact(contact: ChatUser) {
  showNewChatModal.value = false;
  await chatStore.startConversationWith(contact.userId, contact.studentId);
  mobileChatOpen.value = true;
  scrollToBottom();
}

function formatChatTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shouldShowDateHeader(index: number) {
  if (index === 0) return true;
  const current = new Date(chatStore.messages[index]!.createdAt).toDateString();
  const prev = new Date(chatStore.messages[index - 1]!.createdAt).toDateString();
  return current !== prev;
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return t('chat.today');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return t('chat.yesterday');
  return d.toLocaleDateString(locale.value === 'lo' ? 'lo-LA' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

onMounted(async () => {
  await chatStore.fetchConversations();
  await chatStore.fetchContacts();
});
</script>
