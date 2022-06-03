import {FunctionWrapper} from './FunctionWrapper.js'
import {default as nodeFetch} from 'node-fetch'

export const fetchWrapper = () => {
    // Global fetch is available from Node 18
    const originalFetch = global.fetch
    const before = () => {
        if (!originalFetch) {
            global.fetch = nodeFetch
        }
    }
    const after = () => {
        if (!originalFetch) {
            global.fetch = originalFetch
        }
    }

    return new FunctionWrapper(before, after)
}