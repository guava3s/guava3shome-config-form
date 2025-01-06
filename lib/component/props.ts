export function getNormalProps() {
    return {
        placeholder: {
            type: String,
            required: false,
            default: ''
        },
        disable: {
            type: Boolean,
            required: false,
            default: false
        },
        clearable: {
            type: Boolean,
            required: false,
            default: false
        }
    }
}
