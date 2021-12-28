describe('fetchRunner', () => {
    let fetchRunner, mockFetch

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        mockFetch = jest.fn()
        jest.mock('../../../utils/dynamicLoad', () => ({
            dynamicLoad: (dep) => {
                if (dep === 'node-fetch') {
                    return Promise.resolve({default: mockFetch})
                }
                throw new Error(`Unexpected dynamic load of ${dep}`)
            }
        }))
        fetchRunner = require('../../../runner/patches/fetchRunner').fetchRunner
    })

    test('fetchRunner', async () => {
        mockFetch.mockImplementationOnce(() => 'httpResult')
        const fn = async () => {
            expect(await global.fetch('url', 'settings')).toBe('httpResult')
            return 'something'
        }
        expect(global.fetch).toBeUndefined()
        expect(await fetchRunner().run(fn)).toBe('something')
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith('url', 'settings')
        expect(global.fetch).toBeUndefined()
    })
})