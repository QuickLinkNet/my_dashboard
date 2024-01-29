<script setup>
import { computed, onMounted, ref } from 'vue';
import { GridLayout, GridItem } from 'vue3-grid-layout-next';
import ActivityChart from '../components/ActivityChart.vue';
import CryptoPrice from '../components/CryptoPrice.vue';
import PromptManagement from "../components/PromptManagement.vue";

const layout = ref([]);
const selectedComponent = ref('ActivityChart'); // Standardkomponente
const availableComponents = ['ActivityChart', 'CryptoPrice', 'PromptManagement']; // Ersetze dies mit tatsächlichen Komponentennamen
const nextItemId = ref(0);

const saveLayout = async () => {
  try {
    await fetch('http://localhost:3000/api/layout/1', {
      method: 'PUT', // Verwende PUT anstelle von POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout.value)
    });
    console.log('Layout gespeichert');
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  }
};

onMounted(() => {
  fetchLayoutById(1); // Abrufen des Layouts mit ID 1 beim Laden der Komponente
});

const rowHeight = computed(() => {
  const widthOfContainer = document.querySelector('body')?.offsetWidth || 0;
  return Math.floor(widthOfContainer/12) / 2;
});

const importComponent = (componentName) => {
  if (componentName === 'ActivityChart') {
    return ActivityChart;
  } else if(componentName === 'CryptoPrice') {
    return CryptoPrice;
  } else if(componentName === 'PromptManagement') {
    return PromptManagement;
  }
  // Füge hier weitere Bedingungen für andere Komponenten hinzu
  return null;
};

function addNewItem() {
  const newItem = {
    x: (layout.value.length * 2) % 12,
    y: 0,
    w: 4,
    h: 4,
    i: "item-" + nextItemId.value, // Generiere eine eindeutige ID
    component: selectedComponent.value
  };

  layout.value.push(newItem);
  nextItemId.value++; // Inkrementiere den Zähler für das nächste Item
}

const fetchLayoutById = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/layout/${id}`);
    if (!response.ok) {
      throw new Error('Fehler beim Laden des Layouts');
    }
    const data = await response.json();
    layout.value = data;
    layout.value = JSON.parse(data.layout);
    // Hier kannst du das abgerufene Layout im Browser anzeigen
  } catch (error) {
    console.error('Fehler:', error);
  }

  if (layout.value.length > 0) {
    const maxId = Math.max(...layout.value.map(item => parseInt(item.i.replace('item-', ''))));
    nextItemId.value = maxId + 1;
  }
};

const removeItem = (itemId, event) => {
  console.log(itemId);
  event.stopPropagation();
  layout.value = layout.value.filter(item => item.i !== itemId);
};
</script>

<template>
  <div class="top-menu">
    <div class="menu-right">
      <select v-model="selectedComponent">
        <option v-for="comp in availableComponents" :key="comp" :value="comp">{{ comp }}</option>
      </select>
      <button @click="addNewItem" class="menu-button">
        <!-- Icon für "Add New Item", z.B. ein Plus-Icon -->
        <span class="icon">+</span> Add
      </button>
      <button @click="saveLayout" class="menu-button">
        <!-- Icon für "Save", z.B. ein Speicher-Icon -->
        <span class="icon">💾</span> Save
      </button>
    </div>
  </div>
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
          <button class="delete-button" @click="removeItem(item.i, $event)">X</button>
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<style scoped>
.grid-content {
  /* deine bestehenden Stile */
  position: relative; /* Ermöglicht die absolute Positionierung von Kind-Elementen */
}

.delete-button {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  background-color: red;
  color: white;
  cursor: pointer;
}

.grid-content {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  padding: 10px;
  text-align: center;
  height: calc(100% - 20px);
  overflow: hidden;
  touch-action: none;
}
.top-menu {
  width: 100%;
  background-color: #f0f0f0; /* Wähle eine passende Hintergrundfarbe */
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end; /* Elemente nach rechts ausrichten */
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-button {
  margin-left: 10px;
  cursor: pointer;
  /* Weitere Button-Stile hinzufügen */
}

.icon {
  margin-right: 5px;
}
</style>
