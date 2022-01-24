const {FunctionWrapper} = require('./FunctionWrapper')
const {createRun} = require('../../utils/runUtils')

const gushioWrapper = (buildRunner) => {
    const originalGushio = global.gushio
    const before = () => {
        global.gushio = {
            run: createRun(buildRunner),
        }
    }
    const after = () => {
        global.gushio = originalGushio
    }

    return new FunctionWrapper(before, after)
}

module.exports = {gushioWrapper}