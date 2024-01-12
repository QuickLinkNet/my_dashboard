<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import Login from './pages/login.vue'
import Dashboard from "./pages/Dashboard.vue";
import ActivityChart from "./components/ActivityChart.vue";

const auth = false;
</script>

<template>
  <Dashboard></Dashboard>
</template>

<style scoped>
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
