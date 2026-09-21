<script setup lang="ts">
import type { Filter } from "@/types";

type TodoFilterProps = {
  currentFilter: Filter;
};
defineProps<TodoFilterProps>();

const emit = defineEmits<{
  change: [filter: Filter];
}>();

const filters = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
] as const;
</script>

<template>
  <section>
    <h2>filter</h2>
    <div>
      <button
        v-for="filter in filters"
        class="btn"
        :class="{
          active: currentFilter === filter.value,
          nonActive: currentFilter !== filter.value,
        }"
        :key="filter.value"
        @click="emit('change', filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.active {
  background-color: #3b82f6;
}

.nonActive {
  background-color: #929394;
}
</style>
