import c from 'ansi-colors'
import {FunctionWrapper} from './FunctionWrapper.js'

export const patchedStringWrapper = () => {
    const excluded = ['theme', 'alias']
    const properties = Object.getOwnPropertyNames(c).filter(n => !excluded.includes(n))

    const oldProperties = {}
    const before = () => {
        properties.forEach(prop => {
            oldProperties[prop] = Object.getOwnPropertyDescriptor(String.prototype, prop)
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
            const descriptor = oldProperties[prop]
            if (descriptor) {
                Object.defineProperty(String.prototype, prop, descriptor)
            } else {
                delete String.prototype[prop]
            }
        })
    }

    return new FunctionWrapper(before, after)
}