type Branded<T, Brand> = T & { readonly __brand: Brand };

export type TodoId = Branded<string, "todoId">;

export type Todo = {
  id: TodoId;
  text: string;
  done: boolean;
};
