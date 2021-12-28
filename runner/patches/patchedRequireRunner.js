const Module = require('module')
const {FunctionRunner} = require('./FunctionRunner')

const patchedRequireRunner = (patchedRequire) => {
    const before = () => {
        for (const cacheKey in require.cache) {
            delete require.cache[cacheKey]
        }

        Module.prototype.require = patchedRequire
    }

    const after = () => {
        Module.prototype.require = patchedRequire.__originalRequire
    }

    return new FunctionRunner(before, after)
}

module.exports = {patchedRequireRunner}