<script setup lang="ts">
import TodoItem from "@/components/TodoItem.vue";
import type { Todo, TodoId } from "@/types";

type TodoListProps = {
  todos: Todo[];
};
defineProps<TodoListProps>();

const emit = defineEmits<{
  remove: [id: TodoId];
  toggle: [id: TodoId];
}>();
</script>

<template>
  <section>
    <h2>todos</h2>
    <ul>
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @remove="emit('remove', todo.id)"
        @toggle="emit('toggle', todo.id)"
      />
    </ul>
  </section>
</template>

<style scoped></style>
