const c = require('ansi-colors')
const {FunctionWrapper} = require('./FunctionWrapper')

const patchedStringWrapper = () => {
    const excluded = ['theme', 'alias']
    const properties = Object.getOwnPropertyNames(c).filter(n => !excluded.includes(n))

    const before = () => {
        properties.forEach(prop => {
            Object.defineProperty(String.prototype, prop, {
                configurable: true,
                get: function () {
                    return c[prop](this)
                }
            })
        })
    }
    const after = () => {
        properties.forEach(prop => {
            delete String.prototype[prop]
        })
    }

    return new FunctionWrapper(before, after)
}

module.exports = {patchedStringWrapper}