import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

import App from './App.vue'
import PrimeVue from 'primevue/config'

import router from './router'

import '/node_modules/primeflex/primeflex.css'


//theme
import './assets/theme.css';
    
//core
import "primevue/resources/primevue.min.css"

//icons
import 'primeicons/primeicons.css'

import Textarea from 'primevue/textarea'

import Dropdown from 'primevue/dropdown'

import Button from 'primevue/button';

import InputNumber from 'primevue/inputnumber';

import Tooltip from 'primevue/tooltip';

import Dialog from 'primevue/dialog';

import InputText from 'primevue/inputtext';


const app = createApp(App)

app.use(mdiVue, {
    icons: mdijs
  }) 

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.component('Textarea', Textarea)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.directive('tooltip', Tooltip);
app.component('Button', Button)
app.component('InputNumber', InputNumber)
app.mount('#app')
