import type { Thread, ThreadId } from "../types";
import { dateToTimestamp } from "../utils";

const publishThreadId = (): ThreadId => {
  return crypto.randomUUID() as ThreadId;
};

export const createThread = (
  data: Omit<Thread, "id" | "createdAt">,
): Thread => {
  const id = publishThreadId();
  const createdAt = dateToTimestamp(new Date());
  const thread: Thread = {
    id,
    title: data.title,
    createdAt,
  };
  return thread;
};

export const isThreadId = (arg: unknown): arg is ThreadId => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return typeof arg === "string" && uuidV4Regex.test(arg);
};

export const isThread = (arg: unknown): arg is Thread => {
  if (typeof arg !== "object" || arg === null) {
    return false;
  }

  const obj = arg as Record<string, unknown>;

  return (
    // id
    "id" in obj &&
    isThreadId(obj.id) &&
    // title
    "title" in obj &&
    typeof obj.title === "string" &&
    // createdAt
    "createdAt" in obj &&
    typeof obj.createdAt === "number"
  );
};

export const validateThread = (data: Omit<Thread, "id" | "createdAt">) => {};
