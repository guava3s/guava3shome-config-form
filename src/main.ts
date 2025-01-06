import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'


const app = createApp(App)

app.config.globalProperties.$guava3shome = {
    scopeConfig: {
        'scope1': {
            name: {
                id: '1000',
                title: 'Username',
                field: 'name',
                display: true,
                component: () => import('../lib/component/G3Input.vue'),
                required: true,
                order: 1,
                componentProps: {
                    valueType: 'STRING',
                    placeholder: 'Please input name',
                    type: 'number',
                    disable: false
                }
            },
            password: {
                id: '2000',
                title: 'Password',
                field: 'password',
                display: true,
                required: true,
                component: () => import('../lib/component/G3Input.vue'),
                order: 1,
                componentProps: {
                    valueType: 'STRING',
                    placeholder: 'Please input password',
                    type: 'password',
                    disable: false
                }
            },
            color: {
                id: '3000',
                title: 'Password',
                field: 'color',
                display: true,
                required: true,
                component: () => import('../lib/component/G3Input.vue'),
                order: 1,
                componentProps: {
                    valueType: 'STRING',
                    placeholder: 'Please select color',
                    disable: false,
                    type: 'color'
                }
            }
        }
    },
    componentTypeMap: {}
}

app.mount('#app')
