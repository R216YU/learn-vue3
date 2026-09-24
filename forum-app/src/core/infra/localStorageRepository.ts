import type { StorageRepository } from "../interfaces";
import { isPost } from "../entities/post";
import { isThread } from "../entities/thread";
import type { Post, Thread } from "../types";

const STORAGE_KEYS = {
  threads: "forum-app:threads",
  posts: "forum-app:posts",
};

// thread
const getThreads = (): Thread[] => {
  const json = localStorage.getItem(STORAGE_KEYS.threads);

  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((obj) => isThread(obj));
  } catch (err) {
    console.error(`localStorageRepository.getAllThreads Error: ${err}`);
    return [];
  }
};

const saveThreads = (threads: Thread[]): void => {
  const json = JSON.stringify([...threads]);
  localStorage.setItem(STORAGE_KEYS.threads, json);
};

// post
const getPosts = (): Post[] => {
  const json = localStorage.getItem(STORAGE_KEYS.posts);

  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((obj) => isPost(obj));
  } catch (err) {
    console.error(`localStorageRepository.getAllPosts Error: ${err}`);
    return [];
  }
};

const savePosts = (posts: Post[]) => {
  const json = JSON.stringify([...posts]);
  localStorage.setItem(STORAGE_KEYS.posts, json);
};

export const localStorageRepository: StorageRepository = {
  getThreads,
  saveThreads,
  getPosts,
  savePosts,
};
