describe('fetchWrapper', () => {
    let fetchWrapper, fetch

    beforeEach(() => {
        jest.mock('../../../utils/fetch')
        fetch = require('../../../utils/fetch').fetch
        fetchWrapper = require('../../../runner/patches/fetchWrapper').fetchWrapper
    })

    test('fetchWrapper', async () => {
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
})