import type { Post, Thread } from "../types";

export type StorageRepository = {
  getThreads: () => Thread[];
  saveThreads: (threads: Thread[]) => void;
  getPosts: () => Post[];
  savePosts: (posts: Post[]) => void;
};
