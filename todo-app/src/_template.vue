<!-- 変数宣言の箇所 -->
<script setup lang="ts">
const TEXT = "HELLO WORLD!!!";
</script>

<!-- レンダリング要素 -->
<template>
  <h1 class="text">{{ TEXT }}</h1>
</template>

<!-- CSS -->
<style scoped>
.text {
  color: aqua;
}
</style>
