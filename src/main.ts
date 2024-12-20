import 'bootstrap/dist/css/bootstrap.min.css';

import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import router from './router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);

library.add(faPhone);
library.add(faCheckCircle);

app.use(router);
app.use(PrimeVue);
app.use(ToastService);

app.component("font-awesome-icon", FontAwesomeIcon).mount('#EchoLife');
app.component('Button', Button);
app.component('Toast', Toast);
