import type { Post, PostId } from "../types";
import { dateToTimestamp } from "../utils";
import { isThreadId } from "./thread";

const publishPostId = (): PostId => {
  return crypto.randomUUID() as PostId;
};

export const createPost = (data: Omit<Post, "id" | "createdAt">): Post => {
  const id = publishPostId();
  const createdAt = dateToTimestamp(new Date());
  const post: Post = {
    id,
    threadId: data.threadId,
    authorName: data.authorName !== "" ? data.authorName : "名無しさん",
    body: data.body,
    createdAt,
  };

  return post;
};

export const isPostId = (arg: unknown): arg is PostId => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return typeof arg === "string" && uuidV4Regex.test(arg);
};

export const isPost = (arg: unknown): arg is Post => {
  if (typeof arg !== "object" || arg === null) {
    return false;
  }

  const obj = arg as Record<string, unknown>;

  return (
    // id
    "id" in obj &&
    isPostId(obj.id) &&
    // threadId
    "threadId" in obj &&
    isThreadId(obj.threadId) &&
    // authorName
    "authorName" in obj &&
    typeof obj.authorName === "string" &&
    // body
    "body" in obj &&
    typeof obj.body === "string" &&
    // createdAt
    "createdAt" in obj &&
    typeof obj.createdAt === "number"
  );
};

export const validatePost = (data: Omit<Post, "id" | "createdAt">): boolean => {
  return true;
};
