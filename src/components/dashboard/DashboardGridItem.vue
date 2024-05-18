<template>
  <div class="dashboard-grit-item-wrapper">
    <Button icon="pi pi-arrows-alt" class="mr-2" severity="secondary" @click="toggleDrag(item.i)"/>
    <Button icon="pi pi-trash" class="mr-2" severity="secondary" @click="removeItem(item.i, $event)"/>
  </div>
</template>

<script setup>
import Button from "primevue/button";

const props = defineProps({
  item: Object,
  toggleDrag: Function,
  removeItem: Function,
})
</script>

<style>
.dashboard-grit-item-wrapper {
  display: none;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}
</style>
