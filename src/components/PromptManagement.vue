<template>
  <div>
    <button @click="toggleOverlay">Neue Prompt´s</button>
    <FlexOverlay :isOpen="showOverlay" @close="showOverlay = false">
      <template #default>
        <h2>Neuer Prompt</h2>
        <textarea v-model="jsonInput" placeholder="JSON eingeben" @input="validateAndAddPrompts"></textarea>
        <div v-if="validationPassed !== null">
          <span v-if="validationPassed" style="color: green;">✔ Gültiges JSON</span>
          <span v-else style="color: red;">✖ Ungültiges JSON</span>
        </div>
        <div class="buttonWrapper">
          <button @click="validateAndAddPrompts" :disabled="!validationPassed">Speichern</button>
          <button @click="showOverlay = false">Abbrechen</button>
        </div>
      </template>
    </FlexOverlay>

    <FlexOverlay :isOpen="showEditOverlay" @close="toggleEditOverlay(false)">
      <template #default>
        <h2>Prompt bearbeiten</h2>
        <input type="text" v-model="editPromptData.title" placeholder="Titel"/>
        <textarea v-model="editPromptData.prompt" placeholder="Prompt"></textarea>
        <textarea v-model="editPromptData.keywords" placeholder="Keywords"></textarea>
        <div class="buttonWrapper">
          <button @click="saveEditedPrompt">Speichern</button>
        </div>
      </template>
    </FlexOverlay>

    <DataTable :value="prompts" editMode="row" :paginator="true" :rows="10" dataKey="id" :editingRows.sync="editingRows" @row-edit-init="onRowEditInit" @row-edit-cancel="onRowEditCancel" @row-edit-save="onRowEditSave" :filters="globalFilters">
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
import { ref, onMounted } from 'vue';
import FlexOverlay from './FlexOverlay.vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const showOverlay = ref(false);
const showEditOverlay = ref(false);
const jsonInput = ref('');
const validationPassed = ref(null);
const prompts = ref([]);
const editingRows = ref([]);
const editingCache = ref({});
const editPromptData = ref({});
const globalFilters = ref({});

const validateAndAddPrompts = () => {
  try {
    const parsedPrompts = JSON.parse(jsonInput.value);
    if (Array.isArray(parsedPrompts)) {
      validationPassed.value = true;
      savePrompts(parsedPrompts);
    } else {
      throw new Error('Eingabe ist kein Array');
    }
  } catch (error) {
    validationPassed.value = false;
    console.error('Validierungsfehler:', error);
  }
};

const savePrompts = async (promptsToSave) => {
  try {
    await axios.post('http://localhost:3000/api/prompts', promptsToSave);
    fetchPrompts();
    showOverlay.value = false;
    jsonInput.value = '';
  } catch (error) {
    console.error('Fehler beim Speichern der Prompts:', error);
  }
};

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value; // Schaltet zwischen true und false um
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

onMounted(fetchPrompts);
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
