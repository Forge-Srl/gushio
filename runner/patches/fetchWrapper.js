const {FunctionWrapper} = require('./FunctionWrapper')
const {fetch: nodeFetch} = require('../../utils/fetch')

const fetchWrapper = () => {
    const originalFetch = global.fetch
    const before = () => {
        global.fetch = nodeFetch
    }
    const after = () => {
        global.fetch = originalFetch
    }

    return new FunctionWrapper(before, after)
}

module.exports = {fetchWrapper}