const {FunctionWrapper} = require('./FunctionWrapper')
const {createRun} = require('../../utils/runUtils')
const packageInfo = require('../../package.json')
const semverParse = require('semver/functions/parse')

const gushioWrapper = (buildRunner) => {
    const originalGushio = global.gushio
    const before = () => {
        global.gushio = {
            run: createRun(buildRunner),
            version: semverParse(packageInfo.version)
        }
    }
    const after = () => {
        global.gushio = originalGushio
    }

    return new FunctionWrapper(before, after)
}

module.exports = {gushioWrapper}