<script setup lang="ts">
import { createPost } from "@/core/entities/post";
import { createThread } from "@/core/entities/thread";
import { usePosts, useThreads } from "@/composables";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const { addThread } = useThreads();
const { addPost } = usePosts();

const titleInput = ref("");
const authorInput = ref("");
const postInput = ref("");
const err = ref("");

const FORMS = [
  { name: "titleInput", label: "スレッド名", ref: titleInput, type: "text" },
  { name: "authorInput", label: "投稿者名", ref: authorInput, type: "text" },
  { name: "postInput", label: "最初の本文", ref: postInput, type: "textarea" },
];

const onSubmit = () => {
  // validate
  if (!titleInput.value.trim() || !postInput.value.trim()) {
    err.value = "正しく入力してください。";
    return;
  }

  err.value = "";

  // thread, post作成
  const newThread = createThread({ title: titleInput.value.trim() });
  const newPost = createPost({
    threadId: newThread.id,
    authorName: authorInput.value.trim(),
    body: postInput.value.trim(),
  });
  addThread(newThread);
  addPost(newPost);

  // form初期化
  titleInput.value = "";
  authorInput.value = "";
  postInput.value = "";

  //   画面遷移
  router.push(`/threads/${newThread.id}`);
};
</script>

<template>
  <h2>スレッド作成</h2>

  <p class="err" v-if="err">{{ err }}</p>

  <div>
    <div v-for="form in FORMS" :key="form.name">
      <label :for="form.name">{{ form.label }}</label>
      <input
        v-if="form.type === 'text'"
        type="text"
        :name="form.name"
        :id="form.name"
        v-model="form.ref.value"
      />
      <textarea
        v-if="form.type === 'textarea'"
        :name="form.name"
        :id="form.name"
        v-model="form.ref.value"
      ></textarea>
    </div>
  </div>

  <button @click="onSubmit">スレッドを作成する</button>

  <router-link to="/">キャンセル</router-link>
</template>

<style scoped>
.err {
  color: red;
}
</style>
