import G3ConfigForm from './G3ConfigForm.vue'
import type { configFormGlobal } from './typings'
import type { App } from 'vue';

const install = function(app: App) {
    app.component('G3ConfigForm', G3ConfigForm)
}

export const globalConfigForm: configFormGlobal = {
    version: '1.1.3',
    install,
    G3ConfigForm,
}

export { G3ConfigForm }

export default globalConfigForm
