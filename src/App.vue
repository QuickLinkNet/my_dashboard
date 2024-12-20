<script setup lang="ts">
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';

const router = useRouter();
</script>


<template>
  <Toast />
  <router-view></router-view>
</template>

<!--<template>-->
<!--  <Dashboard></Dashboard>-->
<!--</template>-->

<style scoped>
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
