const {FunctionRunner} = require('./FunctionRunner')
const {dynamicLoad} = require('../../utils/dynamicLoad')
const importFetch = dynamicLoad('node-fetch')

const fetchRunner = () => {
    const originalFetch = global.fetch
    const before = () => {
        let _fetch
        global.fetch = async (...args) => {
            if (!_fetch) {
                _fetch = (await importFetch).default
            }
            return await _fetch(...args)
        }
    }
    const after = () => {
        global.fetch = originalFetch
    }

    return new FunctionRunner(before, after)
}

module.exports = {fetchRunner}