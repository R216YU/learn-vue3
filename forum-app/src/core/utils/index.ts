import type { JoinedThreadPosts, Post, Thread } from "../types";

/**
 * ThreadsとPostsをマージする
 */
export const joinThreadPosts = (
  threads: Readonly<Thread[]>,
  posts: Readonly<Post[]>,
): JoinedThreadPosts[] => {
  return threads.map((thread) => {
    const filteredPosts = posts.filter((p) => p.threadId === thread.id);

    return {
      ...thread,
      posts: filteredPosts,
    };
  });
};

/**
 * Dateオブジェクトをタイムスタンプ（ミリ秒）に変換する
 */
export const dateToTimestamp = (date: Date): number => {
  return date.getTime();
};

/**
 * タイムスタンプ（ミリ秒）を YYYY/MM/DD HH:MM:SS 形式の文字列に変換する（ローカル時間）
 */
export const timestampToDateTimeString = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};
