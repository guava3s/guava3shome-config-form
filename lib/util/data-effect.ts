import type {InternalContext} from "guava3shome-h5-utils";
import type {SlaveFieldValueMap} from "../typings/runtime-data-effect.ts";
import type {keyForString, MetaConfig, RunTimeMetaKeyConfig} from "../typings/meta-config.ts";
import {ABILITY_DATA_EFFECT, OPPORTUNITY_PROCESS} from "../typings/ability-control.ts";
import type {MetaConfigDependency} from "../typings/runtime-dependency.ts";


export default function useDataEffect({context, props}: InternalContext) {

    context.abilityProcess.push({
        opportunity: OPPORTUNITY_PROCESS,
        name: ABILITY_DATA_EFFECT,
        order: 10,
        process: () => {
            const fieldList = context.keyConfigList.value
                .map((item: RunTimeMetaKeyConfig) => item.field)
                .filter((field: keyForString<MetaConfig>) => props.keyDataEffect[field]?.length);
            for (const masterField of fieldList) {

                const slaveFieldsMap: Map<keyForString<MetaConfig>, Map<any, any>> = props.keyDataEffect[masterField].reduce((res: Map<keyForString<MetaConfig>, Map<any, any>>, item: SlaveFieldValueMap) => {
                    res.set(item.slaveField, item.slaveValueMap)
                    return res
                }, new Map<keyForString<MetaConfig>, Map<any, any>>())

                for (const [slaveField, slaveValueMap] of Array.from(slaveFieldsMap)) {

                    // 排除互逆依赖
                    if (context.backupKeyDependencies[slaveField]?.find((dep: MetaConfigDependency) => dep.depField === masterField)) {
                        break
                    }

                    for (const [masterValue, slaveValue] of slaveValueMap) {

                        if (context.keyForValues.value[masterField] === masterValue) {
                            context.keyForValues.value[slaveField] = slaveValue
                            break
                        }
                    }
                }
            }
        }
    })


    return {}
}
