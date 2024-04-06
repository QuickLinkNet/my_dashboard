import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';

import 'primevue/resources/themes/saga-blue/theme.css' //theme
import 'primevue/resources/primevue.min.css' //core css
import 'primeicons/primeicons.css' //icons

const app = createApp(App);

app.use(PrimeVue);
app.mount('#EchoLife');

// createApp(App).mount('#EchoLife')
