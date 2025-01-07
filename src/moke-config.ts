export const scopeConfig = {
    'scope1': {
        name: {
            title: 'Username',
            display: true,
            required: true,
            component: () => import('../lib/component/G3Input.vue'),
            order: 1,
            componentProps: {
                valueType: 'STRING',
                placeholder: 'Please input name',
                type: 'number',
                disable: false
            }
        },
        password: {
            title: 'Password',
            display: true,
            required: true,
            component: () => import('../lib/component/G3Input.vue'),
            order: 2,
            componentProps: {
                valueType: 'STRING',
                placeholder: 'Please input password',
                type: 'password',
                disable: false
            }
        },
        color: {
            title: 'Color',
            display: true,
            required: true,
            component: () => import('../lib/component/G3Input.vue'),
            order: 3,
            componentProps: {
                valueType: 'STRING',
                placeholder: 'Please select color',
                disable: false,
                type: 'color'
            }
        }
    }
}
