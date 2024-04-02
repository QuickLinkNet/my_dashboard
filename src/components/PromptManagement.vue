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
    <!-- Tabelle zum Anzeigen der Prompts -->
    <table>
      <thead>
      <tr>
        <th>Titel</th>
        <th>Prompt</th>
        <th>Keywords</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="prompt in prompts" :key="prompt.id">
        <td>{{ prompt.title }}</td>
        <td>{{ prompt.prompt }}</td>
        <td>{{ prompt.keywords }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FlexOverlay from './FlexOverlay.vue';
import axios from 'axios';

const showOverlay = ref(false);
const jsonInput = ref('');
const validationPassed = ref(null);
const prompts = ref([]);

const validateAndAddPrompts = () => {
  try {
    const parsedPrompts = JSON.parse(jsonInput.value);
    if (Array.isArray(parsedPrompts)) {
      validationPassed.value = true;
      // Senden an Backend, wenn gültig
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
    fetchPrompts(); // Aktualisiere die Prompts nach dem Speichern
    showOverlay.value = false;
    jsonInput.value = '';
  } catch (error) {
    console.error('Fehler beim Speichern der Prompts:', error);
  }
};

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value; // Schaltet zwischen true und false um
};

const fetchPrompts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/prompts');
    prompts.value = response.data.prompts;
  } catch (error) {
    console.error('Fehler beim Abrufen der Prompts:', error);
  }
};

onMounted(fetchPrompts);
</script>

<style>
.buttonWrapper {
  display: flex;
  margin-bottom: 12px;
}
</style>
