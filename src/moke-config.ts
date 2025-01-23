import type {MetaConfig} from "../lib/typings/meta-config.ts";

export const scopeConfig = {
    'scope1': {
        name: {
            title: 'Username',
            display: true,
            required: true,
            component: () => import('../lib/component/G3Input.vue'),
            order: 1,
            verifyPrompt: 'Please input name',
            valueType: 'STRING',
            componentProps: {
                placeholder: 'Please input name',
                type: 'text',
                disable: false
            },
            validator: () => {
                return true
            }
        },
        password: {
            title: 'Password',
            display: true,
            required: true,
            component: () => import('../lib/component/G3Input.vue'),
            order: 2,
            verifyPrompt: 'Please input password',
            valueType: 'STRING',
            componentProps: {
                placeholder: 'your password',
                type: 'password',
                disable: false
            },
            dependencies: [
                {
                    depField: 'name',
                    depCondition: 'SOME',
                    depValues: ['SYSTEM'],
                    priority: 1,
                    reset: {
                        display: false,
                        required: false
                    }
                }
            ]
        },
        color: {
            title: 'Color',
            display: true,
            required: true,
            verifyPrompt: 'Please select color',
            component: () => import('../lib/component/G3Input.vue'),
            order: 3,
            valueType: 'STRING',
            componentProps: {
                placeholder: 'your like color',
                disable: false,
                type: 'color'
            }
        }
    }
}
