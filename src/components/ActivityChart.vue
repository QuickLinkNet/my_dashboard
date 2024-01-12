<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'ActivityChart',
  components: { Bar },
  data() {
    return {
      chartData: {
        labels: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        datasets: [
          {
            label: 'Essen',
            data: [12, 19, 3, 5, 2, 3, 10],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Trinken',
            data: [2, 3, 20, 5, 1, 4, 10],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: 'Rauchen',
            data: [3, 10, 13, 15, 22, 30, 20],
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
          },
          {
            label: 'Sport',
            data: [5, 29, 5, 5, 2, 3, 10],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Arbeit',
            data: [20, 30, 23, 25, 22, 33, 40],
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
          }
        ]
      },
      chartOptions: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  }
}
</script>

<template>
  <Bar
      id="activity-chart"
      :options="chartOptions"
      :data="chartData"
  />
</template>

<style>
/* Füge hier bei Bedarf CSS-Stile hinzu */
</style>
