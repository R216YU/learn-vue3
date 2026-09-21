// TODO

import type { TodoId } from "@/types";

/**
 * ブランド型`TodoId`を生成する
 * @returns
 */
export const generateTodoId = (): TodoId => {
  const todoId = crypto.randomUUID();
  return todoId as TodoId;
};
