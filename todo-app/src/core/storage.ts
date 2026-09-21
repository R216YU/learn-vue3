import { toTodo } from "@/core/todo";
import type { Todo } from "@/types";

const STORAGE_KEY = "todos:v1";

//
// StorageRawData
//

const verifyStorageData = (raw: string) => {
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed.map((todo) => toTodo(todo));
  }

  return [];
};

//
// CRUD
//

export const loadTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return verifyStorageData(raw);
  } catch (error) {
    console.error("検証でエラーが発生したため空配列を返却", error);
    // 検証で1件でもエラーが出る場合は空配列を戻す
    return [];
  }
};

export const saveTodos = (todos: Todo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Save Error", error);
  }
};
