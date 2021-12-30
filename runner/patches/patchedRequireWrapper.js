const Module = require('module')
const {FunctionWrapper} = require('./FunctionWrapper')

const patchedRequireWrapper = (patchedRequire) => {
    const before = () => {
        for (const cacheKey in require.cache) {
            delete require.cache[cacheKey]
        }

        Module.prototype.require = patchedRequire
    }

    const after = () => {
        Module.prototype.require = patchedRequire.__originalRequire
    }

    return new FunctionWrapper(before, after)
}

module.exports = {patchedRequireWrapper}