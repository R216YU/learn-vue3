import ThreadPage from "@/features/thread-detail/ThreadPage.vue";
import ThreadList from "@/features/thread-list/ThreadList.vue";
import ThreadNew from "@/features/thread-new/ThreadNew.vue";
import NotFound from "@/NotFound.vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "ThreadList",
    component: ThreadList,
  },
  {
    path: "/threads/new",
    name: "ThreadNew",
    component: ThreadNew,
  },
  {
    path: "/threads/:id",
    name: "ThreadPage",
    component: ThreadPage,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
