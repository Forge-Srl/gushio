const {dynamicLoad} = require('./dynamicLoad')
const importFetch = dynamicLoad('node-fetch')

let _fetch
const fetch = async (...args) => {
    if (!_fetch) {
        _fetch = (await importFetch).default
    }
    return await _fetch(...args)
}

module.exports = {fetch}