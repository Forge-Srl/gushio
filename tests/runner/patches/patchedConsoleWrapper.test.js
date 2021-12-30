describe('patchedConsoleWrapper', () => {
    let patchedConsoleWrapper

    beforeEach(() => {
        patchedConsoleWrapper = require('../../../runner/patches/patchedConsoleWrapper').patchedConsoleWrapper
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