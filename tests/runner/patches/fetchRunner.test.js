describe('fetchRunner', () => {
    let fetchRunner, fetch

    beforeEach(() => {
        jest.mock('../../../utils/fetch')
        fetch = require('../../../utils/fetch').fetch
        fetchRunner = require('../../../runner/patches/fetchRunner').fetchRunner
    })

    test('fetchRunner', async () => {
        fetch.mockImplementationOnce(() => 'httpResult')
        const fn = async () => {
            expect(await global.fetch('url', 'settings')).toBe('httpResult')
            return 'something'
        }
        expect(global.fetch).toBeUndefined()
        expect(await fetchRunner().run(fn)).toBe('something')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledWith('url', 'settings')
        expect(global.fetch).toBeUndefined()
    })
})