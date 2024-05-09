<template>
  <div>
    <Button v-if="loading" label="Checking API connection..." icon="pi pi-check" severity="danger" />
    <Button v-else-if="error" label="Error: {{ error }}" icon="pi pi-check" severity="danger" />
    <Button v-else-if="apiConnected" label="API connected" icon="pi pi-check" severity="success" />
    <Button v-else label="API is not connected" icon="pi pi-check" severity="danger" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'

const loading = ref(true);
const error = ref('');
const apiConnected = ref(false);

onMounted(async () => {
  try {
    const response = await axios.get('http://www.my-dashboard.net:3000/api/health');
    apiConnected.value = response.status === 200;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
