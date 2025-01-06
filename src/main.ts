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
                display: 1,
                readonly: 0,
                component: () => import('../lib/component/G3Input.vue'),
                required: 1,
                order: 1,
                metaProps: {
                    valueType: 'STRING',
                    placeholder: 'Please input name',
                    type: 'number'
                }
            },
            password: {
                id: '2000',
                title: 'Password',
                field: 'password',
                display: 1,
                readonly: 0,
                component: () => import('../lib/component/G3Input.vue'),
                required: 1,
                order: 1,
                metaProps: {
                    valueType: 'STRING',
                    placeholder: 'Please input password',
                    type: 'password'
                }
            },
            color: {
                id: '3000',
                title: 'Password',
                field: 'color',
                display: 1,
                readonly: 0,
                component: () => import('../lib/component/G3Input.vue'),
                required: 1,
                order: 1,
                metaProps: {
                    valueType: 'STRING',
                    placeholder: 'Please select color',
                    type: 'color'
                }
            }
        }
    },
    componentTypeMap: {}
}

app.mount('#app')
