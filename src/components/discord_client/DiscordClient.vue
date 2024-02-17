<template>
  <div>
    <button @click="connectToDiscord">Login to Discord</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Midjourney } from "./src/midjourney"; // Stellen Sie sicher, dass der Importpfad korrekt ist

export default defineComponent({
  name: 'DiscordClient',
  setup() {
    const salai_token = "NDY5MjA3MTE3MTc4MzM5MzY4.GjXk7d.hINgXvovoFEIIHJWbDMZHiMs1FKcjcxyOlaJNc"
    const server_id = "1084714846290984990"
    const channel_id = "1084714846290984993"


    const client = ref<Midjourney | null>(null);

    const connectToDiscord = async () => {
      if (!server_id || !channel_id || !salai_token) {
        console.error('Environment variables are not properly set.');
        return;
      }

      client.value = new Midjourney({
        ServerId: server_id,
        ChannelId: channel_id,
        SalaiToken: salai_token,
        Debug: true,
        Ws: true,
      });

      try {
        await client.value.Connect();
        console.log('Connected to Discord.');
      } catch (error) {
        console.error('Failed to connect to Discord:', error);
      }
    };

    return { connectToDiscord };
  },
});
</script>

<style scoped>
button {
  /* Button-Styling nach Belieben */
}
</style>
