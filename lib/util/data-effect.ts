import {ref} from "vue";
import type {SlaveFieldValueMap} from "../typings/meta-config.ts";
import type {InternalContext} from "guava3shome-h5-utils";

export default function useDataEffect({context, props}: InternalContext) {
    // 禁用数据影响判定数组
    const disableEffect = ref<boolean[]>([])

    function triggerDataEffect(fieldMap: string[]) {
        for (let masterField of fieldMap) {
            if (props.keyDataEffect[masterField]?.length > 0) {

                const slaveFields = new Set()
                props.keyDataEffect[masterField].forEach((item: SlaveFieldValueMap) => {
                    slaveFields.add(item.slaveField)

                    for (const [key, value] of Object.entries(item.slaveValueMap)) {
                        if (context.keyForValues.value[masterField] === key) {
                            disableEffect.value.push(true)
                            context.keyForValues.value[item.slaveField] = value
                            break
                        }
                        disableEffect.value.push(false)
                    }
                })

                triggerDataEffect(Array.from(slaveFields) as string[])
            }
        }
    }

    return {
        disableEffect,
        triggerDataEffect
    }
}
