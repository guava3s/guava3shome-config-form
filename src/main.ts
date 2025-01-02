import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'


const app = createApp(App)

app.config.globalProperties.$guava3shomeScope = {
    'scope1': {

    }
}

app.mount('#app')
