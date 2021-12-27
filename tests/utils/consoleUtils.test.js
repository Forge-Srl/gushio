describe('stringUtils', () => {
    let patchedConsoleRunner

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        patchedConsoleRunner = require('../../utils/consoleUtils').patchedConsoleRunner
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