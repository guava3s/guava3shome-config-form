export function errorDisplayRequired(field: string, display: boolean, required: boolean): void {
    if (!display && required) {
        throw new Error(`The 'display' and 'required' definitions for the '${field}' field may not be meaningful, so if necessary, use 'fixed: true' configuration.`)
    }
}
