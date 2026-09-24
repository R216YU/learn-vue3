<script setup lang="ts">
import { useRoute } from "vue-router";
import ThreadDetail from "./ThreadDetail.vue";
import { isThreadId } from "@/core/entities/thread";
import { computed } from "vue";
import type { JoinedThreadPosts } from "@/core/types/index.js";
import { useThreadDetails } from "@/composables/useThreadDetails";

const route = useRoute();

const { getTargetThreadDetail } = useThreadDetails();

const thread = computed<JoinedThreadPosts | undefined>(() => {
  const id = route.params.id;

  if (isThreadId(id)) {
    return getTargetThreadDetail(id);
  }
});
</script>

<template>
  <h2 v-if="!thread">スレッドが存在しません。 ({{ route.params.id }})</h2>

  <ThreadDetail v-else :thread="thread" />
</template>

<style scoped></style>
