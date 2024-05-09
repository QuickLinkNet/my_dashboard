<template>
  <div>
    <FlexOverlay :isOpen="showOverlay" @close="showOverlay = false">
      <template #default>
        <h2>Neuer Prompt</h2>
        <textarea v-model="jsonInput" placeholder="JSON eingeben" @input="validatePrompts"></textarea>
        <div v-if="validationPassed !== null">
          <span v-if="validationPassed" style="color: green;">✔ Gültiges JSON</span>
          <span v-else style="color: red;">✖ Ungültiges JSON</span>
        </div>
        <div class="buttonWrapper">
          <button @click="savePrompts" :disabled="!validationPassed">Speichern</button>
          <button @click="showOverlay = false">Abbrechen</button>
        </div>
      </template>
    </FlexOverlay>

    <FlexOverlay :isOpen="showEditOverlay" @close="toggleEditOverlay(false)">
      <template #default>
        <h2>Prompt bearbeiten</h2>
        <textarea v-model="editPromptData.title" placeholder="Title"></textarea>
        <textarea v-model="editPromptData.prompt" placeholder="Prompt"></textarea>
        <textarea v-model="editPromptData.keywords" placeholder="Keywords"></textarea>
        <div class="buttonWrapper">
          <button @click="saveEditedPrompt">Speichern</button>
        </div>
      </template>
    </FlexOverlay>

    <DataTable :filters="filters" :globalFilterFields="['title', 'prompt', 'keywords']" filterDisplay="menu" :loading="loading" v-model:filters="globalFilters" showGridlines :value="prompts" editMode="row" :paginator="true" :rows="10" dataKey="id" :editingRows.sync="editingRows" @row-edit-init="onRowEditInit" @row-edit-cancel="onRowEditCancel" @row-edit-save="onRowEditSave" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} prompts"
               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
          <Button @click="toggleOverlay" severity="secondary">Neue Prompt´s</Button>
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </template>
      <template #empty> No entries found. </template>
      <template #loading> Loading customers data. Please wait. </template>
      <Column field="title" header="Title" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern">
        <template #filter>
          <div class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText v-model="globalFilters['title']" @input="onFilter('title', $event.target.value)" placeholder="Filtern" />
          </div>
        </template>
      </Column>
      <Column field="prompt" header="Prompt" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="keywords" header="Keywords" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column :rowEditor="true" headerStyle="width:8rem" bodyStyle="text-align:center"></Column>
    </DataTable>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import FlexOverlay from './FlexOverlay.vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button'

const showOverlay = ref(false);
const showEditOverlay = ref(false);
const jsonInput = ref('');
const validationPassed = ref(null);
const prompts = ref([]);
const editingRows = ref([]);
const editingCache = ref({});
const editPromptData = ref({});
const globalFilters = ref({});
const filters = ref();
const loading = ref(true);
const parsedPrompts = computed(() => {
  if(jsonInput.value !== "") {
    return JSON.parse(jsonInput.value)
  }
});

const clearFilter = () => {
  filters.value['global'].value = null;
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    prompts: { value: null, matchMode: FilterMatchMode.CONTAINS },
    keywords: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
};

initFilters();

const validatePrompts = () => {
  try {
    if (Array.isArray(parsedPrompts.value)) {
      validationPassed.value = true;
    } else {
      throw new Error('Eingabe ist kein Array');
    }
  } catch (error) {
    validationPassed.value = false;
    console.error('Validierungsfehler:', error);
  }
};

const savePrompts = async () => {
  try {
    const modifiedPrompts = parsedPrompts.value.map(prompt => {
      let keywords = prompt.keywords.split(', ').map(keyword => keyword.trim());
      const requiredKeywords = ["generative ai", "generativ", "ki"];

      requiredKeywords.forEach(keyword => {
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }
      });

      return { ...prompt, keywords: keywords.join(", "), expected_runs: "1", successful_runs: "0" };
    });

    await axios.post('http://localhost:3000/api/prompts', modifiedPrompts);
    await fetchPrompts();
    showOverlay.value = false;
    jsonInput.value = '';
  } catch (error) {
    console.error('Fehler beim Speichern der Prompts:', error);
  }
};

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value;
};

const toggleEditOverlay = (isOpen) => {
  showEditOverlay.value = isOpen;
};

const fetchPrompts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/prompts');
    prompts.value = response.data.prompts;
  } catch (error) {
    console.error('Fehler beim Abrufen der Prompts:', error);
  }
};


const onRowEditInit = (event) => {
  toggleEditOverlay(true);
  editingCache.value[event.data.id] = { ...event.data };
  editPromptData.value = editingCache.value[event.data.id];
};

const onRowEditCancel = (event) => {
  const originalData = editingCache.value[event.data.id];
  if (originalData) {
    Object.assign(event.data, originalData);
    delete editingCache.value[event.data.id];
  }
};

const onRowEditSave = async (event) => {
  try {
    const editedPrompt = event.data;
    await axios.put(`http://localhost:3000/api/prompts/${editedPrompt.id}`, editedPrompt);
    await fetchPrompts(); // Aktualisiere die Tabelle nach dem Speichern
  } catch (error) {
    console.error('Fehler beim Speichern der Änderungen:', error);
  }
};

const onFilter = (value, filter) => {
  if (filter === 'title') {
    filters.value['global'].value = value;
  }
};

const saveEditedPrompt = async () => {
  if (editPromptData.value.title && editPromptData.value.prompt && editPromptData.value.id) {
    try {
      await axios.put(`http://localhost:3000/api/prompts/${editPromptData.value.id}`, {
        title: editPromptData.value.title,
        prompt: editPromptData.value.prompt,
        keywords: editPromptData.value.keywords,
      });

      await fetchPrompts();
      showEditOverlay.value = false;

      console.log('Prompt erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Prompts:', error);
    }
  } else {
    console.error('Nicht alle erforderlichen Felder sind ausgefüllt.');
  }
};

onMounted(() => {
  fetchPrompts();
  loading.value = false;
});
</script>

<style>
.buttonWrapper {
  display: flex;
  margin-bottom: 12px;
}

.p-datatable .p-datatable-tbody > tr > td {
  font-size: 12px;
}
</style>
