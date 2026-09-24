import { computed, ref, watch } from "vue";
import type { Post, PostId } from "@/core/types";
import { localStorageRepository as storage } from "@/core/infra/localStorageRepository";

const _posts = ref<Post[]>(storage.getPosts());
const sortedPosts = computed(() =>
  [..._posts.value].sort((a, b) => a.createdAt - b.createdAt),
);
watch(_posts, () => storage.savePosts([..._posts.value]), { deep: true });

export const usePosts = () => {
  const addPost = (post: Post) => {
    _posts.value = [..._posts.value, post];
  };

  const removePost = (postId: PostId) => {
    _posts.value = _posts.value.filter((p) => p.id !== postId);
  };

  return { posts: sortedPosts, addPost, removePost };
};
