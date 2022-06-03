import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import semver from 'semver'

describe('fetchWrapper', () => {
    let fetchWrapper, fetch

    beforeEach(async () => {
        fetch = jest.fn()
        jest.unstable_mockModule('node-fetch', () => ({default: fetch}))
        fetchWrapper = (await import('../../../runner/patches/fetchWrapper.js')).fetchWrapper
    })

    if (semver.satisfies(process.versions.node, '<18')) {
        test('fetchWrapper before Node 18', async () => {
            fetch.mockImplementationOnce(() => 'httpResult')
            const fn = async () => {
                expect(await global.fetch('url', 'settings')).toBe('httpResult')
                return 'something'
            }
            expect(global.fetch).toBeUndefined()
            expect(await fetchWrapper().run(fn)).toBe('something')
            expect(fetch).toHaveBeenCalledTimes(1)
            expect(fetch).toHaveBeenCalledWith('url', 'settings')
            expect(global.fetch).toBeUndefined()
        })
    } else {
        test('fetchWrapper from Node 18', async () => {
            const capturedFetch = global.fetch
            const fn = async () => {
                expect(global.fetch).toBe(capturedFetch)
                return 'something'
            }
            expect(global.fetch).not.toBeUndefined()
            expect(await fetchWrapper().run(fn)).toBe('something')
            expect(fetch).not.toHaveBeenCalled()
            expect(global.fetch).toBe(capturedFetch)
        })
    }
})