describe('ora', () => {
    let ora, mockOra

    beforeEach(() => {
        mockOra = jest.fn()
        jest.mock('../../utils/dynamicLoad', () => ({
            dynamicLoad: (dep) => {
                if (dep === 'ora') {
                    return Promise.resolve({oraPromise: mockOra})
                }
                throw new Error(`Unexpected dynamic load of ${dep}`)
            }
        }))
        ora = require('../../utils/ora').ora
    })

    test('fetchRunner', async () => {
        mockOra.mockImplementationOnce(() => 'spinner')
        expect(await ora('promise', 'textOrSettings')).toBe('spinner')
        expect(mockOra).toHaveBeenCalledTimes(1)
        expect(mockOra).toHaveBeenCalledWith('promise', 'textOrSettings')
    })
})