import { readonly, ref, watch } from "vue";
import type { Thread } from "@/core/types";
import { localStorageRepository as storage } from "@/core/infra/localStorageRepository";

const _threads = ref<Thread[]>(storage.getThreads());
watch(_threads, () => storage.saveThreads([..._threads.value]), { deep: true });

export const useThreads = () => {
  const addThread = (thread: Thread) => {
    _threads.value = [..._threads.value, thread];
  };

  return { threads: readonly(_threads), addThread } as const;
};
