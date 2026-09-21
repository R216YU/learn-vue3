<!-- 変数宣言の箇所 -->
<script setup lang="ts">
import type { Todo, TodoId } from "@/types";

interface Props {
  todos: Todo[];
}
</script>

<!-- レンダリング要素 -->
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id" :class="{ done: todo.done }">
      <input type="checkbox" v-model="todo.done" />
      <span>{{ todo.text }}</span>
      <button @click="remove(todo.id)">削除</button>
    </li>
  </ul>
</template>

<!-- CSS -->
<style scoped>
.done {
  text-decoration: line-through;
}
</style>
