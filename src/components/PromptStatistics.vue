<template>
  <div>
    <!-- KPI Cards -->
    <div class="kpi-cards">
      <div class="kpi-card">
        <h3>Erfolgreiche Prompts (Gesamt)</h3>
        <p>{{ totalSuccessfulRuns }}</p>
      </div>
      <div class="kpi-card">
        <h3>Durchschnittliche Erfolgsquote</h3>
        <p>{{ averageSuccessRate }}%</p>
      </div>
      <div class="kpi-card">
        <h3>Top Prompt (Erfolgreiche Runs)</h3>
        <p>{{ topPromptTitle }}</p>
      </div>
      <div class="kpi-card">
        <h3>Top Keywords</h3>
        <p>{{ topKeywords.join(', ') }}</p>
      </div>
    </div>

    <!-- Date Picker and Navigation -->
    <div class="date-controls">
      <button @click="prevMonth" :disabled="disablePrevMonth">← Vorheriger Monat</button>
      <span>{{ formatMonthYear(selectedMonth) }}</span>
      <button @click="nextMonth" :disabled="disableNextMonth">Nächster Monat →</button>
    </div>

    <!-- Logs Table or Stats -->
<!--    <div v-if="logs.length">-->
<!--      <h3>Logs für den ausgewählten Zeitraum:</h3>-->
<!--      <table class="logs-table">-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th>Prompt ID</th>-->
<!--          <th>Datum</th>-->
<!--          <th>Erfolgreiche Runs</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        <tr v-for="log in logs" :key="log.id">-->
<!--          <td>{{ log.prompt_id }}</td>-->
<!--          <td>{{ formatDate(log.timestamp) }}</td>-->
<!--          <td>{{ log.successful_runs }}</td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </table>-->
<!--    </div>-->
<!--    <div v-else>-->
<!--      <p>Keine Logs für den ausgewählten Zeitraum.</p>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

// Daten für KPI Cards
const totalSuccessfulRuns = ref(0);
const averageSuccessRate = ref(0);
const topPromptTitle = ref('');
const topKeywords = ref([]);

// Logs für den ausgewählten Zeitraum
const logs = ref([]);
const selectedMonth = ref(dayjs().startOf('month'));

// Berechnete Werte für Buttons
const disablePrevMonth = ref(false);
const disableNextMonth = ref(true);

// Funktion, um den Monat zu formatieren
const formatMonthYear = (date) => dayjs(date).format('MMMM YYYY');
const formatDate = (date) => dayjs(date).format('DD.MM.YYYY');

// Monat zurück
const prevMonth = () => {
  selectedMonth.value = dayjs(selectedMonth.value).subtract(1, 'month').startOf('month');
  fetchLogs();
  checkMonthLimits();
};

// Monat vor
const nextMonth = () => {
  selectedMonth.value = dayjs(selectedMonth.value).add(1, 'month').startOf('month');
  fetchLogs();
  checkMonthLimits();
};

// Überprüfen, ob Buttons deaktiviert sein sollen
const checkMonthLimits = () => {
  disablePrevMonth.value = dayjs(selectedMonth.value).isBefore(dayjs().subtract(1, 'year'), 'month');
  disableNextMonth.value = dayjs(selectedMonth.value).isSameOrAfter(dayjs(), 'month');
};

// Funktion, um die Logs zu holen
const fetchLogs = async () => {
  try {
    const { data } = await axios.get('http://www.my-dashboard.net:3000/api/prompt-success-logs', {
      params: {
        startDate: dayjs(selectedMonth.value).startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs(selectedMonth.value).endOf('month').format('YYYY-MM-DD')
      }
    });
    logs.value = data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Logs:', error);
  }
};

// Funktion, um die Daten zu holen (für KPI Cards und Logs)
const fetchKPIStats = async () => {
  try {
    // Hole alle Prompt-Daten und berechne Statistiken
    const { data } = await axios.get('http://www.my-dashboard.net:3000/api/prompts');
    if (data && data.prompts.length > 0) {
      const prompts = data.prompts;
      let successfulRuns = 0;
      let totalExpectedRuns = 0;
      const keywordMap = new Map();

      prompts.forEach(prompt => {
        successfulRuns += prompt.successful_runs;
        totalExpectedRuns += prompt.expected_runs;

        // Zähle die Keywords
        if (prompt.keywords) {
          prompt.keywords.split(',').forEach(keyword => {
            const cleanKeyword = keyword.trim().toLowerCase();
            keywordMap.set(cleanKeyword, (keywordMap.get(cleanKeyword) || 0) + 1);
          });
        }
      });

      // Setze die Werte für die KPI Cards
      totalSuccessfulRuns.value = successfulRuns;
      averageSuccessRate.value = totalExpectedRuns > 0
          ? ((successfulRuns / totalExpectedRuns) * 100).toFixed(2)
          : 0;

      // Finde den Top-Prompt
      const topPrompt = prompts.reduce((max, prompt) => prompt.successful_runs > max.successful_runs ? prompt : max, prompts[0]);
      topPromptTitle.value = topPrompt.title;

      // Top Keywords
      topKeywords.value = [...keywordMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);
    }

    await fetchLogs();
  } catch (error) {
    console.error('Fehler beim Abrufen der Statistiken:', error);
  }
};

// Initialisiere die Statistiken und Logs beim Mounten
onMounted(fetchKPIStats);
</script>

<style scoped>
.kpi-cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.kpi-card {
  flex: 1;
  background-color: #f7f7f7;
  padding: 20px;
  margin-right: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.kpi-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.kpi-card p {
  font-size: 24px;
  font-weight: bold;
  color: #2a9d8f;
}

.kpi-card:last-child {
  margin-right: 0;
}

.date-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.date-controls button {
  background-color: #2a9d8f;
  color: white;
  padding: 10px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.date-controls button:disabled {
  background-color: #ccc;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.logs-table th, .logs-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.logs-table th {
  background-color: #f4f4f4;
}

.logs-table tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
