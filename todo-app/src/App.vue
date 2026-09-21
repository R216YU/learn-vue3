<script setup lang="ts">
import { computed, ref } from "vue";

type Todo = {
  id: TodoId;
  text: string;
  done: boolean;
};

type TodoId = string & { readonly __brand: "todoId" };

const generateTodoId = (): TodoId => {
  const todoId = crypto.randomUUID();
  return todoId as TodoId;
};

const todos = ref<Todo[]>([]);

const inputDraft = ref("");
const canAdd = computed(() => inputDraft.value.trim() !== "");

const add = () => {
  if (!canAdd.value) {
    return;
  }

  const newTodo: Todo = {
    id: generateTodoId(),
    text: inputDraft.value.trim(),
    done: false,
  };

  todos.value.push(newTodo);

  inputDraft.value = "";
};

const remove = (id: TodoId) => {
  const i = todos.value.findIndex((todo) => todo.id === id);

  if (i === -1) {
    return;
  }

  todos.value.splice(i, 1); // indexから1要素だけ削除する
};

type Filter = "all" | "active" | "completed";

const currentFilter = ref<Filter>("all");

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case "all":
      return todos.value;
    case "active":
      return todos.value.filter((todo) => !todo.done);
    case "completed":
      return todos.value.filter((todo) => todo.done);
    default:
      return todos.value;
  }
});

const activeCount = computed(
  () => filteredTodos.value.filter((todo) => !todo.done).length,
);
</script>

<template>
  <h1>todo-app</h1>

  <!-- ADD -->
  <section>
    <h2>add todo</h2>

    <form @submit.prevent="add">
      <input v-model="inputDraft" type="text" />
      <button type="submit" :disabled="!canAdd">Add</button>
    </form>
  </section>

  <!-- FILTER -->
  <section>
    <h2>filter</h2>
    <div>
      <button
        @click="currentFilter = 'all'"
        :class="{
          active: currentFilter === `all`,
          nonActive: currentFilter !== `all`,
        }"
      >
        すべて
      </button>
      <button
        @click="currentFilter = 'active'"
        :class="{
          active: currentFilter === `active`,
          nonActive: currentFilter !== `active`,
        }"
      >
        未完了
      </button>
      <button
        @click="currentFilter = 'completed'"
        :class="{
          active: currentFilter === `completed`,
          nonActive: currentFilter !== `completed`,
        }"
      >
        完了済み
      </button>
    </div>
  </section>

  <!-- LIST -->
  <section>
    <h2>todos</h2>
    <p>残件数: {{ activeCount }}</p>
    <ul>
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="{ done: todo.done }"
      >
        <input type="checkbox" v-model="todo.done" />
        <span>{{ todo.text }}</span>
        <button @click="remove(todo.id)">削除</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.done {
  text-decoration: line-through;
}

.active {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nonActive {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background-color: #929394;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
</style>
