<script setup lang="ts">
import { computed, ref } from "vue";

const emit = defineEmits<{
  add: [text: string];
}>();

const todoInput = ref("");
const canAdd = computed(() => todoInput.value.trim() !== "");

const onAddSubmit = () => {
  if (!canAdd.value) {
    return;
  }
  emit("add", todoInput.value);
  todoInput.value = "";
};
</script>

<template>
  <section>
    <h2>add todo</h2>

    <form @submit.prevent="onAddSubmit">
      <input v-model="todoInput" type="text" />
      <button type="submit" :disabled="!canAdd">Add</button>
    </form>
  </section>
</template>

<style scoped></style>
