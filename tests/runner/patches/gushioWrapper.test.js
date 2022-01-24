describe('gushioWrapper', () => {
    let wrapper, createRun

    beforeEach(() => {
        jest.mock('../../../utils/runUtils')
        createRun = require('../../../utils/runUtils').createRun
        wrapper = require('../../../runner/patches/gushioWrapper')
    })

    test('gushioWrapper', async () => {
        createRun.mockImplementationOnce((runner) => {
            expect(runner).toBe('runner')
            return 'gushioRun'
        })

        const fn = async () => {
            expect(global.gushio).toStrictEqual({
                run: 'gushioRun'
            })
            return 'something'
        }
        expect(global.gushio).toBeUndefined()
        expect(await wrapper.gushioWrapper('runner').run(fn)).toBe('something')
        expect(global.gushio).toBeUndefined()
    })
})