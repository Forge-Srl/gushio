import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import semver from 'semver'

describe('fetchWrapper', () => {
    let fetchWrapper, fetch

    beforeEach(async () => {
        fetch = jest.fn()
        jest.unstable_mockModule('node-fetch', () => ({default: fetch}))
        fetchWrapper = (await import('../../../runner/patches/fetchWrapper.js')).fetchWrapper
    })

    test('fetchWrapper', async () => {
        fetch.mockImplementationOnce(() => 'httpResult')
        const fn = async () => {
            expect(await global.fetch('url', 'settings')).toBe('httpResult')
            return 'something'
        }
        const capturedFetch = global.fetch
        // Global fetch is available as experimental from Node 18
        if (semver.satisfies(process.versions.node, '<18')) {
            expect(global.fetch).toBeUndefined()
        } else {
            expect(global.fetch).not.toBeUndefined()
        }
        expect(await fetchWrapper().run(fn)).toBe('something')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledWith('url', 'settings')
        expect(global.fetch).toBe(capturedFetch)
    })
})