import './assets/main.scss'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';


import router from './router'

// PrimeFlex (utility classes)
import 'primeflex/primeflex.css'

// PrimeIcons
import 'primeicons/primeicons.css'

// PrimeVue Components
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Card from 'primevue/card'


// PrimeVue Directives
import Tooltip from 'primevue/tooltip'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  // Default theme configuration
  theme: {
      preset: Aura,
      options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
      }
  }
});


// MDI Vue (Material Design Icons)
app.use(mdiVue, {
  icons: mdijs
})

const theme: any = {
  '--p-primary-color': '#f16736',          
  '--p-primary-color-text': '#ffffff',     
  '--p-surface-ground': '#1e1e1e',         
  '--p-surface-card': '#262626',
  '--p-text-color': 'rgba(255, 255, 255, 0.87)',           
  '--p-border-color': '#cbd5e1',
  '--p-focus-ring-color': '#f16736', 
  '--p-textarea-disabled-background': '#262626',
  '--p-select-option-selected-focus-background': '#262626',
  '--p-select-option-selected-background': 'hsla(0,0%,100%,.04)',
  '--p-button-primary-hover-background': 'rgba(241, 103, 54, 0.8)', 
  '--p-button-primary-active-border-color': '#f16736',
  '--p-button-primary-active-background': '#f16736',
  '--p-button-primary-hover-border-color': '#f16736',
}

for (const key in theme) {
  document.documentElement.style.setProperty(key, theme[key])
}

// Components
app.component('Textarea', Textarea)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Select', Select)
app.component('Button', Button)
app.component('InputNumber', InputNumber)
app.component('FloatLabel', FloatLabel)
app.component('Card', Card)
// Directives
app.directive('tooltip', Tooltip)

app.mount('#app')