import {TriggerType} from "../lib/typings/runtime-validate.ts";

export const scopeConfig = {
    'scope1': {
        name: {
            title: 'Test1',
            display: true,
            required: {
                value: true,
                message: 'Please input name'
            },
            component: () => import('../lib/component/G3Input.vue'),
            order: 1,
            valueType: 'STRING',
            componentProps: {
                placeholder: 'Please input name',
                type: 'text',
                disable: false
            },
            validator: {
                triggerType: TriggerType.change,
                triggerDelay: 0,
                validate: async (value: string) => {
                    if (value.length > 32) {
                        return {
                            success: false,
                            message: 'The username length should not exceed 32.'
                        }
                    }

                    return new Promise((resolve) => {
                        setTimeout(() => {
                            console.log('promise to set timeout value=', value)
                            if (value.includes('A')) {
                                resolve({
                                    success: false,
                                    message: 'fuck'
                                })
                            } else {
                                resolve({
                                    success: true,
                                    message: ''
                                })
                            }
                        }, 1000)
                    })
                }
            },
        },
        password: {
            title: 'Test2',
            display: true,
            required: {
                value: true,
                message: 'Please input password'
            },
            component: () => import('../lib/component/G3Input.vue'),
            order: 2,
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
        }
    }
}
