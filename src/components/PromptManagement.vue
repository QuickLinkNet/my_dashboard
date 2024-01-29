<script setup>
import { ref, onMounted } from 'vue';
import EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import FlexOverlay from './FlexOverlay.vue';
import axios from 'axios';

const prompts = ref([]);
const showOverlay = ref(false);
const jsonInput = ref('');
const repetitionsInput = ref(0);
const currentPage = ref(1);
const pageSize = 10;

const headers = [
  { text: 'ID', value: 'id', sortable: true },
  { text: 'Titel', value: 'title', sortable: true },
  { text: 'Prompt', value: 'prompt', sortable: true },
  { text: 'Keywords', value: 'keywords' },
  { text: 'Erwartete Durchläufe', value: 'expected_runs' },
  { text: 'Erfolgreiche Durchläufe', value: 'successful_runs' },
];

const fetchPrompts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/prompts');
    prompts.value = response.data.prompts;
  } catch (error) {
    console.error('Fehler beim Abrufen der Prompts:', error);
  }
};

const addPromptsFromJson = async () => {
  try {
    const newPrompts = JSON.parse(jsonInput.value).map(prompt => ({
      ...prompt,
      expected_runs: repetitionsInput.value,
      successful_runs: 0
    }));

    if (Array.isArray(newPrompts)) {
      await axios.post('http://localhost:3000/api/prompts', newPrompts);
      jsonInput.value = '';
      repetitionsInput.value = 0;
      showOverlay.value = false;
      fetchPrompts();
    } else {
      alert('Ungültiges Format: Es muss ein Array sein');
    }
  } catch (e) {
    alert('Ungültiges JSON');
  }
};

onMounted(fetchPrompts);
</script>

<template>
  <div>
    <EasyDataTable
        :items="prompts"
        :headers="headers"
    />

    <button @click="showOverlay = true">Add Prompt</button>
    <FlexOverlay v-if="showOverlay">
      <template #default>
        <h2>Prompts hinzufügen</h2>
        <textarea v-model="jsonInput" placeholder="Füge JSON hier ein" class="json-input"></textarea>
        <input type="number" v-model.number="repetitionsInput" placeholder="Erwartete Durchläufe" />
        <button @click="addPromptsFromJson">Speichern</button>
        <button @click="showOverlay = false">Abbrechen</button>
      </template>
    </FlexOverlay>
  </div>
</template>

<style>
.json-input {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
  padding: 8px;
}
</style>
