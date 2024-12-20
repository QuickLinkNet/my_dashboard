<script setup>
import { computed, onMounted, ref } from 'vue';
import { GridLayout, GridItem } from 'vue3-grid-layout-next';
import ActivityChart from '../components/ActivityChart.vue';
import CryptoPrice from '../components/CryptoPrice.vue';
import PromptManagement from "../components/PromptManagement.vue";
import ApiHealthCheck from "../components/api/apiHealthCheck.vue";
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar';
import Dropdown from 'primevue/dropdown';
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DashboardGridItem from "../components/dashboard/DashboardGridItem.vue";
import ToDo from "../components/ToDo.vue";

const show = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
};

const toast = useToast();
const layout = ref([]);
const availableComponents = [
  {
    name: 'ActivityChart',
  }, {
    name: 'CryptoPrice',
  }, {
    name: 'PromptManagement',
  }, {
    name: 'DiscordClient'
  }, {
    name: 'ToDo'
  }
]
const selectedComponent = ref(availableComponents[0]); // Standardkomponente
const nextItemId = ref(0);

const saveLayout = async () => {
  try {
    const layoutId = 1; // Angenommen, Sie möchten das Layout mit ID 1 aktualisieren
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/layout/${layoutId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout.value)
    });
    toast.add({ severity: 'success', summary: 'success', detail: 'Layout successfully saved', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'error', detail: 'Layout could not be saved', life: 3000 });
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
  } else if(componentName === 'DiscordClient') {
    return DiscordClient;
  } else if(componentName === 'ToDo') {
    return ToDo;
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
    i: "item-" + nextItemId.value, // Nutzt jetzt korrekt inkrementierte nextItemId
    component: selectedComponent.value,
    isDraggable: false
  };

  layout.value.push(newItem);
  nextItemId.value++; // Inkrementiere den Zähler für das nächste Item korrekt
}

const fetchLayoutById = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/layout/${id}`);
    if (!response.ok) {
      throw new Error('Fehler beim Laden des Layouts');
    }
    const data = await response.json();
    if (data.layout) {
      layout.value = JSON.parse(data.layout);
      nextItemId.value = layout.value.reduce((max, item) => {
        const itemIdNumber = parseInt(item.i.split('-')[1]);
        return itemIdNumber > max ? itemIdNumber : max;
      }, 0) + 1;
    } else {
      toast.add({ severity: 'info', summary: 'info', detail: 'Layout data is blank or in incorrect format', life: 3000 });
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'error', detail: error, life: 3000 });
  }
};


const removeItem = (itemId, event) => {
  event.stopPropagation();
  layout.value = layout.value.filter(item => item.i !== itemId);
};

const toggleDrag = (itemId) => {
  const item = layout.value.find(i => i.i === itemId);
  if (item) {
    item.isDraggable = !item.isDraggable;
  }
}
</script>

<template>

  <div class="card flex justify-content-center">
    <Toast />
  </div>

  <Toolbar>
    <template #start>
      <api-health-check class=" mr-2"></api-health-check>
    </template>

    <template #end>
      <Dropdown v-model="selectedComponent" :options="availableComponents" optionLabel="name" placeholder="Select a Component" class="md:w-14rem mr-2" />
      <Button icon="pi pi-plus" class="mr-2" severity="secondary" @click="addNewItem" />
      <Button icon="pi pi-save" class="mr-2" severity="secondary" @click="saveLayout" />
    </template>
  </Toolbar>
  <div class="grid-container">
    <GridLayout
        :layout="layout"
        :colNum="12"
        :rowHeight="rowHeight"
        :isDraggable="false"
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
          :is-draggable="item.isDraggable"
      >
        <div class="grid-content">
          <dashboard-grid-item :item=item :remove-item="removeItem" :toggle-drag="toggleDrag"></dashboard-grid-item>
          <component :is="importComponent(item.component.name)" v-if="item.component" />
          <div v-else>{{ item.i }}</div>
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<style scoped>
.grid-content {
  position: relative;
  font-size: 12px;
  overflow-y: scroll;
  border: 2px solid #a8a8a8;
  border-radius: 2px;
  background-color: #fff;
  padding: 10px;
  text-align: center;
  height: calc(100% - 20px);
  touch-action: none;
}

.grid-content:hover .dashboard-grit-item-wrapper {
  display: block;
}
</style>

This image captures a high-speed journey through a digital universe, where vibrant data streams converge into a brilliant nexus of information. It symbolizes the explosive growth of digital data and the complex networks that drive our connected world.
Featuring a dynamic visualization of a cybernetic core, this image portrays the pulsating heart of digital evolution. The intense light at the center represents the source of innovation and technology driving the modern digital era.
This image offers a glimpse into the future, depicting streams of data flowing towards a distant horizon. It represents the continuous and rapid movement of information in tomorrow's digital networks, highlighting the endless possibilities of technological advancement.
Illustrating the moment of technological singularity, this image showcases the convergence of data and light into a singular point, representing the fusion of human intelligence and artificial intelligence into a new form of existence.
This visualization captures the essence of the information superhighway, where data travels at the speed of light. The vibrant lines and intense focus point reflect the ultra-fast, efficient, and expansive nature of modern digital communications.
