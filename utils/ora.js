const {dynamicLoad} = require('./dynamicLoad')
const importOra = dynamicLoad('ora')

let _ora
const ora = async (...args) => {
    if (!_ora) {
        _ora = (await importOra).oraPromise
    }
    return await _ora(...args)
}

module.exports = {ora}