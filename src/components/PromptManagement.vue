<script lang="ts">
import { ref, computed } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';

const jsonInput = ref('');
const prompts = ref([
  // Beispiel-Daten oder leer initialisieren
]);
const searchTerm = ref('');
const isEditing = ref(false);
const editPromptData = ref({});
const editIndex = ref(-1);

const filteredPrompts = computed(() => {
  if (searchTerm.value) {
    return prompts.value.filter((prompt) =>
        prompt.prompt.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        prompt.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        prompt.keywords.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  return prompts.value;
});

const editPrompt = (index: number) => {
  isEditing.value = true;
  editIndex.value = index;
  editPromptData.value = { ...prompts.value[index] };
};

const savePrompt = () => {
  prompts.value[editIndex.value] = { ...editPromptData.value };
  cancelEdit();
};

const cancelEdit = () => {
  isEditing.value = false;
  editPromptData.value = {};
  editIndex.value = -1;
};

const deletePrompt = (index: number) => {
  prompts.value.splice(index, 1);
};

const addPromptsFromJson = () => {
  try {
    const newPrompts = JSON.parse(jsonInput.value);
    if (Array.isArray(newPrompts)) {
      prompts.value.push(...newPrompts);
      jsonInput.value = '';
    } else {
      alert('Ungültiges Format: Es muss ein Array sein');
    }
  } catch (e) {
    alert('Ungültiges JSON');
  }
};
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-3">Prompt-Verwaltung</h2>

    <div class="mb-3">
      <input type="text" id="search" class="form-control" v-model="searchTerm" @input="searchPrompts" placeholder="Suche...">
    </div>

    <div v-for="(prompt, index) in filteredPrompts" :key="index" class="card mb-3">
      <div class="card-body">
        <h3 class="card-title">{{ prompt.title }}</h3>
        <p class="card-text">{{ prompt.prompt }}</p>
        <div>{{ prompt.keywords }}</div>
        <button @click="editPrompt(index)" class="btn btn-primary">Bearbeiten</button>
        <button @click="deletePrompt(index)" class="btn btn-danger">Löschen</button>
      </div>
    </div>

    <div v-if="isEditing" class="mb-3">
      <input type="text" id="editTitle" class="form-control mb-2" v-model="editPromptData.title" placeholder="Titel">
      <input type="text" id="editPrompt" class="form-control mb-2" v-model="editPromptData.prompt" placeholder="Prompt">
      <input type="text" id="editKeywords" class="form-control mb-2" v-model="editPromptData.keywords" placeholder="Keywords">
      <button @click="savePrompt" class="btn btn-success">Speichern</button>
      <button @click="cancelEdit" class="btn btn-secondary">Abbrechen</button>
    </div>

    <div class="mb-3">
      <textarea v-model="jsonInput" class="form-control" placeholder="Füge JSON hier ein"></textarea>
      <button @click="addPromptsFromJson" class="btn btn-info mt-2">Prompts hinzufügen</button>
    </div>
  </div>
</template>

<style>
/* Füge hier bei Bedarf CSS-Stile hinzu */
.prompt-item {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
