import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Button from 'primevue/button';

const app = createApp(App);

library.add(faPhone);
library.add(faCheckCircle);

app.use(PrimeVue);
app.component("font-awesome-icon", FontAwesomeIcon).mount('#EchoLife');
app.component('Button', Button);

// createApp(App).mount('#EchoLife')
