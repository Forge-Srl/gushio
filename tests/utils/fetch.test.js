describe('fetch', () => {
    let fetch, mockFetch

    beforeEach(() => {
        mockFetch = jest.fn()
        jest.mock('../../utils/dynamicLoad', () => ({
            dynamicLoad: (dep) => {
                if (dep === 'node-fetch') {
                    return Promise.resolve({default: mockFetch})
                }
                throw new Error(`Unexpected dynamic load of ${dep}`)
            }
        }))
        fetch = require('../../utils/fetch').fetch
    })

    test('fetchWrapper', async () => {
        mockFetch.mockImplementationOnce(() => 'httpResult')
        expect(await fetch('url', 'settings')).toBe('httpResult')
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith('url', 'settings')
    })
})