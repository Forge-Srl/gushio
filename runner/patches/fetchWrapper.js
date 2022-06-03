import {FunctionWrapper} from './FunctionWrapper.js'
import {default as nodeFetch} from 'node-fetch'

export const fetchWrapper = () => {
    const originalFetch = global.fetch
    const before = () => {
        global.fetch = nodeFetch
    }
    const after = () => {
        global.fetch = originalFetch
    }

    return new FunctionWrapper(before, after)
}