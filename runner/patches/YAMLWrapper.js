import YAML from 'yaml'
import {FunctionWrapper} from './FunctionWrapper.js'

export const YAMLWrapper = () => {
    const originalYAML = global.YAML
    const before = () => {
        global.YAML = YAML
    }
    const after = () => {
        global.YAML = originalYAML
    }

    return new FunctionWrapper(before, after)
}