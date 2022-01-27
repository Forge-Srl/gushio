const {FunctionWrapper} = require('./FunctionWrapper')
const YAML = require('yaml')

const YAMLWrapper = () => {
    const originalYAML = global.YAML
    const before = () => {
        global.YAML = YAML
    }
    const after = () => {
        global.YAML = originalYAML
    }

    return new FunctionWrapper(before, after)
}

module.exports = {YAMLWrapper}