describe('YAMLWrapper', () => {
    let YAMLWrapper

    beforeEach(() => {
        YAMLWrapper = require('../../../runner/patches/YAMLWrapper').YAMLWrapper
    })

    test('YAMLWrapper', async () => {
        const fn = async () => {
            expect(await global.YAML).toBe(require('yaml'))
            return 'something'
        }
        expect(global.YAML).toBeUndefined()
        expect(await YAMLWrapper().run(fn)).toBe('something')
        expect(global.YAML).toBeUndefined()
    })
})