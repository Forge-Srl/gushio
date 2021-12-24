describe('FunctionRunner', () => {
    let FunctionRunner

    beforeEach(() => {
        FunctionRunner = require('../../utils/FunctionRunner').FunctionRunner
    })

    test('run', async () => {
        const before = jest.fn()
        const after = jest.fn()

        const functionRunner = new FunctionRunner(before, after)
        const fn = async () => {
            expect(before).toHaveBeenNthCalledWith(1)
            expect(after).not.toHaveBeenCalled()
            return Promise.resolve('someValue')
        }
        expect(before).not.toHaveBeenCalled()
        expect(await functionRunner.run(fn)).toBe('someValue')
        expect(after).toHaveBeenNthCalledWith(1)
    })

    test('combine', async () => {
        const checkArray = []
        const combined = FunctionRunner.combine(
            new FunctionRunner(() => checkArray.push('before_1'), () => checkArray.push('after_1')),
            new FunctionRunner(() => checkArray.push('before_2'), () => checkArray.push('after_2')),
            new FunctionRunner(() => checkArray.push('before_3'), () => checkArray.push('after_3')),
        )
        expect(await combined.run(() => {checkArray.push('run'); return 55})).toBe(55)
        expect(checkArray).toStrictEqual(['before_1', 'before_2', 'before_3', 'run', 'after_3', 'after_2', 'after_1'])
    })
})