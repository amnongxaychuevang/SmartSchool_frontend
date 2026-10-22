<template>
  <div>
    <ChatBox />
  </div>
</template>

<script setup lang="ts">
import ChatBox from '../../components/chat/ChatBox.vue';

definePageMeta({ layout: 'parent' });
const { t } = useI18n();
useHead({ title: () => `${t('chat.title')} — ${t('parentPortal.title')}` });
</script>
