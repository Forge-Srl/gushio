import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('patchedConsoleWrapper', () => {
    let patchedConsoleWrapper

    beforeEach(async () => {
        patchedConsoleWrapper = (await import('../../../runner/patches/patchedConsoleWrapper.js')).patchedConsoleWrapper
    })

    test('patchedConsoleWrapper', async () => {
        const fn = async () => {
            expect(console).toBe('some console')
            return 'something'
        }
        expect(console).not.toBe('some console')
        expect(await patchedConsoleWrapper('some console').run(fn)).toBe('something')
        expect(console).not.toBe('some console')
    })
})