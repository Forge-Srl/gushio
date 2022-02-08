import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('YAMLWrapper', () => {
    let YAMLWrapper

    beforeEach(async () => {
        YAMLWrapper = (await import('../../../runner/patches/YAMLWrapper.js')).YAMLWrapper
    })

    test('YAMLWrapper', async () => {
        const fn = async () => {
            expect(await global.YAML).toBe((await import('yaml')).default)
            return 'something'
        }
        expect(global.YAML).toBeUndefined()
        expect(await YAMLWrapper().run(fn)).toBe('something')
        expect(global.YAML).toBeUndefined()
    })
})