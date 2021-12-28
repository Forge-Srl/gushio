describe('patchedConsoleRunner', () => {
    let patchedConsoleRunner

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        patchedConsoleRunner = require('../../../runner/patches/patchedConsoleRunner').patchedConsoleRunner
    })

    test('patchedConsoleRunner', async () => {
        const fn = async () => {
            expect(console).toBe('some console')
            return 'something'
        }
        expect(console).not.toBe('some console')
        expect(await patchedConsoleRunner('some console').run(fn)).toBe('something')
        expect(console).not.toBe('some console')
    })
})