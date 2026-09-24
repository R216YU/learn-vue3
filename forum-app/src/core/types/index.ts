export type Branded<T, Brand> = T & { readonly __brand: Brand };

// thread
export type ThreadId = Branded<string, "threadId">;

export type Thread = {
  id: ThreadId; // 一意なID（例: crypto.randomUUID()）
  title: string; // スレッドのタイトル
  createdAt: number; // 作成日時（Date.now() のミリ秒）
};

// post
export type PostId = Branded<string, "postId">;

export type Post = {
  id: PostId; // 一意なID
  threadId: ThreadId; // どのスレッドに属するか
  authorName: string; // 投稿者名（未入力なら "名無しさん"）
  body: string; // 本文
  createdAt: number; // 投稿日時
};

// relation
export type JoinedThreadPosts = Thread & { posts: Post[] };
