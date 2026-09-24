<script setup lang="ts">
import { useThreadDetails } from "@/composables";
import { timestampToDateTimeString } from "@/core/utils";

import { computed, ref } from "vue";

const { threadDetails } = useThreadDetails();

const keyword = ref("");

const sortedThreadDetails = computed(() => {
  return threadDetails.value
    .filter((thread) =>
      keyword.value
        ? thread.title.toLowerCase().includes(keyword.value.toLowerCase())
        : true,
    )
    .map((thread) => {
      const lastPost = thread.posts.at(-1);

      return {
        ...thread,
        latestUpdatedAt: lastPost ? lastPost.createdAt : thread.createdAt,
      };
    })
    .sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
});
</script>

<template>
  <h2>スレッド一覧</h2>

  <p><router-link to="/threads/new">新しくスレッドを作る</router-link></p>

  <div>
    <label for="keyword">タイトル検索: </label>
    <input type="text" v-model="keyword" />
  </div>

  <div class="contents" v-if="sortedThreadDetails.length > 0">
    <div v-for="thread in sortedThreadDetails" :key="thread.id" class="card">
      <p>
        <router-link :to="`/threads/${thread.id}`">{{
          thread.title
        }}</router-link>
      </p>
      <p>投稿数: {{ thread.posts.length }}件</p>
      <p>
        最終投稿日時:
        {{ timestampToDateTimeString(thread.latestUpdatedAt) }}
      </p>
    </div>
  </div>

  <p v-if="threadDetails.length === 0">スレッドが存在しません。</p>
  <p v-else-if="sortedThreadDetails.length === 0">検索結果が0件です</p>
</template>

<style scoped>
.contents {
  margin-top: 8rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}

.card {
  border: 1px solid black;
  border-radius: 16px;
  padding: 16px;
}
</style>
