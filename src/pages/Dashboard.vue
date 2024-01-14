<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { GridLayout, GridItem } from 'vue3-grid-layout-next';
import ActivityChart from '../components/ActivityChart.vue';
// import { LayoutItem } from "../types/LayoutItem";

const layout = ref([]);

watch(layout, () => {;
  saveLayout();
}, { deep: true });

const fetchLayout = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/layout');
    if (!response.ok) {
      throw new Error('Fehler beim Laden des Layouts');
    }
    const data = await response.json();
    if (data && data.length > 0) {
      layout.value = JSON.parse(data[0].layout);
    }
    console.log('Fetched data');
  } catch (error) {
    console.error('Fehler:', error);
  }
};

const saveLayout = async () => {
  try {
    await fetch('http://localhost:3000/api/layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout.value)
    });
    console.log('Layout gespeichert');
    // alert('Layout gespeichert');
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    // alert('Fehler beim Speichern des Layouts');
  }
};

onMounted(fetchLayout);

const rowHeight = computed(() => {
  const widthOfContainer = document.querySelector('body')?.offsetWidth || 0;
  return Math.floor(widthOfContainer/12) / 2;
});

const importComponent = (componentName) => {
  if (componentName === 'ActivityChart') {
    return ActivityChart;
  }
  // Füge hier weitere Bedingungen für andere Komponenten hinzu
  return null;
};

function addNewItem() {
  const newItem = {
    x: (layout.value.length * 2) % 12,
    y: 0, // platziert das Element am unteren Rand des Layouts
    w: 4,
    h: 4,
    i: "item-" + layout.value.length,
    component: "ActivityChart"
  };

  layout.value.push(newItem);
  console.log(layout.value);
}
</script>

<template>
  <div class="grid-container">
    <GridLayout
        :layout="layout"
        :colNum="12"
        :rowHeight="rowHeight"
        :isDraggable="true"
        :isResizable="true"
        :verticalCompact="true"
        :margin="[10, 10]"
    >
      <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
      >
        <div class="grid-content">
          <component :is="importComponent(item.component)" v-if="item.component" />
          <div v-else>{{ item.i }}</div>
        </div>
      </GridItem>
    </GridLayout>

    <button @click="addNewItem">+ Add New Item</button>
    <!-- <button @click="saveLayout">Layout speichern</button> -->
  </div>
</template>

<style scoped>
.grid-content {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  padding: 10px;
  text-align: center;
  height: calc(100% - 20px);
  overflow: hidden;
}
</style>
