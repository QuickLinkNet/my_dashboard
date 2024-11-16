import 'bootstrap/dist/css/bootstrap.min.css';

import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

const app = createApp(App);

library.add(faPhone);
library.add(faCheckCircle);

app.use(PrimeVue);
app.use(ToastService);

app.component("font-awesome-icon", FontAwesomeIcon).mount('#EchoLife');
app.component('Button', Button);
app.component('Toast', Toast);
