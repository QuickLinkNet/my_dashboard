<template>
  <div>
    <button @click="connectToDiscord">Login to Discord</button>
    <div>
      <input v-model="message" placeholder="Nachricht eingeben" />
      <button @click="sendMessage">Nachricht senden</button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const message = ref('');

    const connectToDiscord = async () => {
      // Implementiere die Logik für den Discord-Login hier.
      // Diese Funktion hängt davon ab, wie du die Discord-Authentifizierung handhabst.
      alert("Discord-Login-Funktionalität muss noch implementiert werden.");
    };

    const sendMessage = async () => {
      if (!message.value.trim()) {
        alert('Bitte eine Nachricht eingeben.');
        return;
      }

      try {
        const response = await axios.post('/api/send-discord-message', {
          channelId: '1084714846290984993', // Stelle sicher, dass du hier den korrekten Channel-ID einsetzt
          message: message.value
        });
        console.log(response);
        alert('Nachricht erfolgreich gesendet!');
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        alert('Fehler beim Senden der Nachricht.');
      }

      message.value = ''; // Nachrichtenfeld leeren
    };

    return {
      connectToDiscord,
      sendMessage,
      message
    };
  }
});
</script>

<style scoped>
button {
  /* Button-Styling nach Belieben */
}

input {
  margin-top: 20px;
  padding: 10px;
  font-size: 16px;
}
</style>
