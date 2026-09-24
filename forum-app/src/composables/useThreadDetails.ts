import { computed } from "vue";
import { usePosts } from "./usePosts";
import { useThreads } from "./useThreads";
import type { ThreadId } from "@/core/types";
import { joinThreadPosts } from "@/core/utils";

export const useThreadDetails = () => {
  const { threads: _threads } = useThreads();
  const { posts } = usePosts();

  const threadDetails = computed(() =>
    joinThreadPosts(_threads.value, posts.value),
  );

  const getTargetThreadDetail = (threadId: ThreadId) => {
    return threadDetails.value.find((t) => t.id === threadId);
  };

  return {
    threadDetails,
    getTargetThreadDetail,
  };
};
