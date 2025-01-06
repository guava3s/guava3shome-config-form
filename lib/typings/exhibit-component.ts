
export type ExhibitComponent =
    'INPUT' |
    'INPUT_NUMBER' |
    'PASSWORD' |
    'COLOR' |
    'SELECT_BY_DICT_VALUE' |
    'SELECT_BY_DICT_MULTI_VALUE' |
    'SELECT_BY_DICT_VALUE_SORT_NUMBER' |
    'SELECT_BY_DICT_HIDE_VALUE_SORT_NUMBER' |
    'SELECT_BY_DICT_ID' |
    'SELECT_BY_DICT_MULTI_ID' |
    'CUSTOM_OPTION_SELECT_BY_DICT_VALUE' |
    'CUSTOM_OPTION_SELECT_BY_ID' |
    'CUSTOM_OPTION_SELECT_BY_MULTI_ID' |
    'CUSTOM_OPTION_SELECT_BY_MULTI_VALUE' |
    'RATE' |
    'SLIDER' |
    'RADIO' |
    'TEXTAREA' |
    'TREE_CASCADE' |
    'CUSTOM_OPTION_TREE_CASCADE' |
    'CHECKBOX' |
    'TEXTAREA_JSON' |
    'ARRAY_BY_TAG'

export type ComponentValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'BASE_ARRAY'
export type ComponentValue = string | number | boolean | string[] | number[] | boolean[]
