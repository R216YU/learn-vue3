<script setup lang="ts">
import type { Todo } from "@/types";

type TodoItemProps = {
  todo: Todo;
};
defineProps<TodoItemProps>();

const emit = defineEmits<{
  remove: [];
  toggle: [];
}>();
</script>

<template>
  <li>
    <input type="checkbox" :checked="todo.done" @change="emit('toggle')" />
    <span
      :class="{
        done: todo.done,
      }"
      >{{ todo.text }}</span
    >
    <button @click="emit('remove')">削除</button>
  </li>
</template>

<style scoped>
.done {
  text-decoration: line-through;
}
</style>
