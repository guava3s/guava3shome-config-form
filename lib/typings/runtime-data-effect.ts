import type {keyForString, MetaConfig} from "./meta-config.ts";

export interface DataEffect {
    [masterField: keyForString<MetaConfig>]: SlaveFieldValueMap[]
}

export interface SlaveFieldValueMap {
    slaveField: keyForString<MetaConfig>
    slaveValueMap: Map<any, any>
}
