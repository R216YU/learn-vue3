import { createTodo, loadTodos, saveTodos } from "@/core";
import { type Filter, type Todo, type TodoId } from "@/types";
import { computed, ref, watch } from "vue";

export const useTodo = () => {
  const _todos = ref<Todo[]>(loadTodos());
  const currentFilter = ref<Filter>("all");

  // _todosを監視して、変更があったときに第二引数の関数を実行する
  watch(_todos, () => saveTodos(_todos.value), { deep: true });

  const filteredTodos = computed(() => {
    switch (currentFilter.value) {
      case "all":
        return _todos.value;
      case "active":
        return _todos.value.filter((todo) => !todo.done);
      case "completed":
        return _todos.value.filter((todo) => todo.done);
    }
  });

  const activeCount = computed(
    () => _todos.value.filter((todo) => !todo.done).length,
  );

  const addTodo = (input: string) => {
    const newTodo = createTodo(input);
    _todos.value.push(newTodo);
  };

  const toggleTodo = (id: TodoId) => {
    const targetTodo = _todos.value.find((todo) => todo.id === id);
    if (!targetTodo) {
      return;
    }
    targetTodo.done = !targetTodo.done;
  };

  const removeTodo = (id: TodoId) => {
    const i = _todos.value.findIndex((todo) => todo.id === id);

    if (i === -1) {
      return;
    }

    _todos.value.splice(i, 1); // indexから1要素だけ削除する
  };

  const changeFilter = (filter: Filter) => {
    currentFilter.value = filter;
  };

  return {
    currentFilter,
    filteredTodos,
    activeCount,
    addTodo,
    toggleTodo,
    removeTodo,
    changeFilter,
  };
};
