<template>
  <div>
    <ChatBox />
  </div>
</template>

<script setup lang="ts">
import ChatBox from '../../components/chat/ChatBox.vue';

definePageMeta({ layout: 'teacher' });
const { t } = useI18n();
useHead({ title: () => `${t('chat.title')} — Teacher Portal` });
</script>
