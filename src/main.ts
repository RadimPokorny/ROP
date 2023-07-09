import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import PrimeVue from 'primevue/config'

import router from './router'

//theme
import './assets/theme.css';
    
//core
import "primevue/resources/primevue.min.css"

//icons
import 'primeicons/primeicons.css'

import Textarea from 'primevue/textarea'

import Dropdown from 'primevue/dropdown'

import Button from 'primevue/button';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.component('Textarea', Textarea)
app.component('Dropdown', Dropdown)
app.component('Button', Button)
app.mount('#app')
