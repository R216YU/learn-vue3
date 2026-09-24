<script setup lang="ts">
import { ref } from "vue";
import { createPost } from "@/core/entities/post";
import type { JoinedThreadPosts, PostId } from "@/core/types";
import { usePosts } from "@/composables";
import { timestampToDateTimeString } from "@/core/utils";

type ThreadDetailProps = {
  thread: JoinedThreadPosts;
};

const props = defineProps<ThreadDetailProps>();

const { addPost, removePost } = usePosts();

const authorName = ref("");
const body = ref("");
const err = ref("");

const onSubmit = () => {
  if (!body.value.trim()) {
    err.value = "入力内容を確認してください。";
    return;
  }

  err.value = "";

  const newPost = createPost({
    threadId: props.thread.id,
    authorName: authorName.value.trim(),
    body: body.value.trim(),
  });

  addPost(newPost);

  authorName.value = "";
  body.value = "";
};

const onDelete = (id: PostId) => {
  const con = confirm(`削除しますか?: ${id}`);
  if (con) {
    removePost(id);
  }
};

const FORMS = [
  {
    name: "authorName",
    label: "投稿者名",
    ref: authorName,
    type: "input",
  },
  {
    name: "body",
    label: "本文",
    ref: body,
    type: "textarea",
  },
];
</script>

<template>
  <div>
    <h2>{{ thread.title }} (id: {{ thread.id }})</h2>
    <router-link to="/">一覧に戻る</router-link>

    <div>
      <div v-for="(post, i) in thread.posts" :key="post.id" class="post">
        <div>
          <p>No. {{ i + 1 }}</p>
          <p>
            {{ post.authorName }} ({{
              timestampToDateTimeString(post.createdAt)
            }})
          </p>
        </div>

        <p class="text">{{ post.body }}</p>
        <button @click="onDelete(post.id)">削除する</button>
      </div>
    </div>

    <div>
      <div v-for="form in FORMS">
        <label :for="form.name">{{ form.label }}</label
        >:
        <input
          v-if="form.type == 'input'"
          type="text"
          max="20"
          :name="form.name"
          :id="form.name"
          v-model="form.ref.value"
        />
        <textarea
          v-if="form.type == 'textarea'"
          maxlength="500"
          :name="form.name"
          :id="form.name"
          v-model="form.ref.value"
        ></textarea>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
      <button @click="onSubmit">投稿</button>
    </div>
  </div>
</template>

<style scoped>
.post {
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.err {
  color: red;
}

.text {
  white-space: pre-wrap;
}
</style>
