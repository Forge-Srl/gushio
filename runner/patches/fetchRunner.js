const {FunctionRunner} = require('./FunctionRunner')
const {fetch: nodeFetch} = require('../../utils/fetch')

const fetchRunner = () => {
    const originalFetch = global.fetch
    const before = () => {
        global.fetch = nodeFetch
    }
    const after = () => {
        global.fetch = originalFetch
    }

    return new FunctionRunner(before, after)
}

module.exports = {fetchRunner}