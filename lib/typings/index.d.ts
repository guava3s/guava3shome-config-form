import G3ConfigForm from '../G3ConfigForm.vue'
import { globalConfigForm } from '../index'
import type { App } from 'vue';
export interface configFormGlobal {
    version: string,
    install: (app: App) => void,
    G3ConfigForm: typeof G3ConfigForm
}

export {
    G3ConfigForm
}

export default globalConfigForm
