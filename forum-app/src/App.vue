<script setup lang="ts"></script>

<template>
  <header class="header">
    <h1 class="title">Forum-App</h1>
    <router-link class="link-btn" to="/">スレッド一覧</router-link>
  </header>

  <main class="container">
    <router-view />
  </main>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid gray;
  padding: 4px 8px;
  margin: 0;
  height: 40px;
}

.title {
  font-size: 1.5rem;
}

.link-btn {
  text-decoration: none;
}
.link-btn:hover {
  text-decoration: underline;
  color: brown;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
