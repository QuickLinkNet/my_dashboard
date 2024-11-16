<template>
  <div class="container-fluid">
    <FlexOverlay :isOpen="showOverlay" @close="showOverlay = false">
      <template #default>
        <h2 class="mb-3">Neuer Prompt</h2>
        <textarea v-model="jsonInput" placeholder="JSON eingeben" @input="validatePrompts"></textarea>
        <div v-if="validationPassed !== null" class="mt-2">
          <span v-if="validationPassed" class="text-success">✔ Gültiges JSON</span>
          <span v-else class="text-danger">✖ Ungültiges JSON</span>
        </div>
        <div class="d-flex mt-3">
          <button @click="savePrompts" :disabled="!validationPassed" class="btn btn-primary">Speichern</button>
        </div>
      </template>
    </FlexOverlay>

    <FlexOverlay :isOpen="showEditOverlay" @close="toggleEditOverlay(false)">
      <template #default>
        <h2 class="mb-3">Prompt bearbeiten</h2>
        <textarea v-model="editPromptData.title" placeholder="Title" class="mb-2"></textarea>
        <textarea v-model="editPromptData.prompt" placeholder="Prompt" class="mb-2"></textarea>
        <textarea v-model="editPromptData.keywords" placeholder="Keywords" class="mb-2"></textarea>
        <div class="d-flex mt-3">
          <button @click="saveEditedPrompt" class="btn btn-primary">Speichern</button>
        </div>
      </template>
    </FlexOverlay>

    <div class="d-flex flex-wrap mb-3 gap-2 button-container">
      <Button @click="showPromptList = true" label="Prompt List" class="btn-secondary button-responsive" />
      <Button @click="showPromptList = false" label="Usage Statistics" class="btn-secondary button-responsive" />
    </div>

    <div v-if="showPromptList">
      <DataTable :filters="filters" :globalFilterFields="['title', 'prompt', 'keywords']" filterDisplay="menu"
                 :loading="loading" v-model:filters="globalFilters" showGridlines :value="prompts"
                 editMode="row" :paginator="true" :rows="10" dataKey="id" :editingRows.sync="editingRows"
                 @row-edit-init="onRowEditInit" @row-edit-cancel="onRowEditCancel"
                 @row-edit-save="onRowEditSave" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} prompts"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
        <template #header>
          <div class="row g-2 mb-2">
            <div class="col-12 col-md-6">
              <IconField class="w-100">
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="w-100" />
              </IconField>
            </div>
            <div class="col-6 col-md-3">
              <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" class="w-100" />
            </div>
            <div class="col-6 col-md-3">
              <Button @click="toggleOverlay" severity="secondary" class="w-100">Neue Prompt´s</Button>
            </div>
          </div>
        </template>
        <template #empty>
          <p class="text-center mt-3">Keine Einträge gefunden.</p>
        </template>
        <template #loading>
          <p class="text-center mt-3">Daten werden geladen. Bitte warten...</p>
        </template>
        <Column field="title" header="Title" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern" />
        <Column field="prompt" header="Prompt" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern" />
        <Column field="keywords" header="Keywords" :sortable="true" :filter="true" filterMatchMode="contains" filterPlaceholder="Filtern" />
        <Column :rowEditor="true" headerStyle="width:8rem" bodyStyle="text-align:center" />
      </DataTable>
    </div>

    <div v-else>
      <PromptStatistics :logs="logs" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import FlexOverlay from './FlexOverlay.vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from 'primevue/api';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';
import PromptStatistics from "./PromptStatistics.vue";

const logs = ref([]);
const showPromptList = ref(true);
const showOverlay = ref(false);
const showEditOverlay = ref(false);
const jsonInput = ref('');
const validationPassed = ref(null);
const prompts = ref([]);
const editingRows = ref([]);
const editingCache = ref({});
const editPromptData = ref({});
const globalFilters = ref({});
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  prompt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  keywords: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const loading = ref(true);

const parsedPrompts = computed(() => {
  if (jsonInput.value !== "") {
    return JSON.parse(jsonInput.value);
  }
});

const clearFilter = () => {
  filters.value['global'].value = null;
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    prompt: { value: null, matchMode: FilterMatchMode.CONTAINS },
    keywords: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
};

const fetchLogs = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/prompt-success-logs`);
    logs.value = response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

watch(showPromptList, (newValue) => {
  if (!newValue) {
    fetchLogs();
  }
});

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
      let keywords = Array.isArray(prompt.keywords) ? prompt.keywords.join(", ") : prompt.keywords;
      ["generative ai", "generativ", "ki"].forEach(keyword => {
        if (!keywords.includes(keyword)) keywords += `, ${keyword}`;
      });
      return { ...prompt, keywords, expected_runs: "10", successful_runs: "0" };
    });

    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/prompts`, modifiedPrompts);
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/prompts`);
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
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/prompts/${editedPrompt.id}`, editedPrompt);
    await fetchPrompts();
  } catch (error) {
    console.error('Fehler beim Speichern der Änderungen:', error);
  }
};

const saveEditedPrompt = async () => {
  if (editPromptData.value.title && editPromptData.value.prompt && editPromptData.value.id) {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/prompts/${editPromptData.value.id}`, {
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

<style scoped>
.buttonWrapper {
  display: flex;
  margin-bottom: 12px;
}
textarea {
  width: 100%;
  margin-bottom: 12px;
}
.text-center {
  text-align: center;
}
.text-success {
  color: green;
}
.text-danger {
  color: red;
}
.p-datatable .p-datatable-tbody > tr > td {
  font-size: 12px;
}
@media (min-width: 768px) {
  .button-responsive {
    flex: 0;
    width: auto;
  }
}
.gap-2 > * {
  margin-right: 0.5rem;
}
.button-responsive {
  flex: 1 1 auto;
}

.button-container {
  display: flex;
  justify-content: flex-start;
}

.button-responsive {
  flex: 0;
}

@media (max-width: 991px) {
  .button-responsive {
    width: 100%;
    flex: 1 1 100%;
  }
}
</style>
