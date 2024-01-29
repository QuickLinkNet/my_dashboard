<template>
  <div>
    <div>
      <p>Bitcoin: {{ prices.bitcoin.toFixed(2) }} {{ currentCurrency }}</p>
      <p>Dogecoin: {{ prices.dogecoin.toFixed(2) }} {{ currentCurrency }}</p>
    </div>
    <button @click="toggleCurrency">Wechsel zu {{ currentCurrency === 'eur' ? 'usd' : 'eur' }}</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const prices = ref({ bitcoin: 0, dogecoin: 0, bnr: 0 });
const currentCurrency = ref('eur');
const exchangeRate = ref(1); // Wechselkurs von € zu $

const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/cryptoprices');
    const data = response.data;
    return {
      bitcoin: data.bitcoin[currentCurrency.value.toLowerCase()],
      dogecoin: data.dogecoin[currentCurrency.value.toLowerCase()],
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Kryptowährungskurse:', error);
    return { bitcoin: 0, dogecoin: 0, bnr: 0 };
  }
};

const fetchExchangeRateFromAPI = async () => {
  // Fiktiver Wechselkurs, ersetze dies durch einen echten API-Aufruf
  return 1.1; // Beispiel: 1€ = 1.1$
};

const updatePrices = async () => {
  const cryptoPrices = await fetchCryptoPrices();
  const rate = currentCurrency.value === 'eur' ? 1 : exchangeRate.value;

  prices.value = {
    bitcoin: cryptoPrices.bitcoin * rate,
    dogecoin: cryptoPrices.dogecoin * rate,
    bnr: cryptoPrices.bnr * rate,
  };
};

const toggleCurrency = () => {
  currentCurrency.value = currentCurrency.value === '€' ? 'usd' : 'eur';
  updatePrices(); // Aktualisiere die Preise nach dem Währungswechsel
};

onMounted(async () => {
  exchangeRate.value = await fetchExchangeRateFromAPI();
  updatePrices();
  setInterval(updatePrices, 300000); // Aktualisiere alle 5 Minuten
});
</script>

<style scoped>
/* Füge hier bei Bedarf CSS-Stile hinzu */
</style>
