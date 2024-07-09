<script lang="ts">
    import Converter from '../App.vue'

    import '../assets/main.scss'
import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

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

</script>

<template>
<main>
    <Converter/>
</main>
</template>
