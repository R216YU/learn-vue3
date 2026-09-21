// BRANDED
type Branded<T, Brand> = T & { readonly __brand: Brand };

// TODO
export type TodoId = Branded<string, "todoId">;

export type Todo = {
  id: TodoId;
  text: string;
  done: boolean;
};

// FILTER
export type Filter = "all" | "active" | "completed";
