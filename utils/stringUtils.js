const c = require('ansi-colors')
const {FunctionRunner} = require('./FunctionRunner')

const patchedStringRunner = () => {
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

    return new FunctionRunner(before, after)
}

module.exports = {patchedStringRunner}