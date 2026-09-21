<script setup lang="ts">
import { TodoInput, TodoFilter, TodoList } from "@/components";
import { useTodo } from "@/composables";

const {
  currentFilter,
  filteredTodos,
  activeCount,
  addTodo,
  toggleTodo,
  removeTodo,
  changeFilter,
} = useTodo();
</script>

<template>
  <TodoInput @add="addTodo" />
  <TodoFilter :current-filter="currentFilter" @change="changeFilter" />
  <p>残件数: {{ activeCount }}</p>
  <TodoList :todos="filteredTodos" @toggle="toggleTodo" @remove="removeTodo" />
</template>

<style scoped></style>
