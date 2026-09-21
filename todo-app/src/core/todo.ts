import type { Todo, TodoId } from "@/types";

//
// TodoId
//

const isTodoId = (id: unknown): id is TodoId => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return typeof id === "string" && uuidV4Regex.test(id);
};

const toTodoId = (id: unknown): TodoId => {
  if (isTodoId(id)) {
    return id;
  }

  throw new Error("not TodoId");
};

//
// Todo
//

const isTodo = (todo: unknown): todo is Todo => {
  return (
    // todo自体の検証
    typeof todo === "object" &&
    todo !== null &&
    // idの検証
    "id" in todo &&
    typeof todo.id === "string" &&
    isTodoId(todo.id) &&
    // textの検証
    "text" in todo &&
    typeof todo.text === "string" &&
    "done" in todo &&
    typeof todo.done === "boolean"
  );
};

export const toTodo = (todo: unknown): Todo => {
  if (isTodo(todo)) {
    return todo;
  }

  throw new Error("not Todo");
};

// TodoGenerator

const generateTodoId = (): TodoId => {
  const todoId = crypto.randomUUID();
  return todoId as TodoId;
};

const validateTodoInput = (input: string): boolean => {
  return input.trim() !== "";
};
export const createTodo = (input: string): Todo => {
  const valid = validateTodoInput(input);

  if (!valid) {
    throw Error("todoが入力されていない");
  }

  return {
    id: generateTodoId(),
    text: input.trim(),
    done: false,
  };
};
