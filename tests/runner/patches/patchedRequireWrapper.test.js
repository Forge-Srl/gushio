describe('patchedRequireWrapper', () => {
    let patchedRequireWrapper, Module

    beforeEach(() => {
        Module = require('module')
        patchedRequireWrapper = require('../../../runner/patches/patchedRequireWrapper').patchedRequireWrapper
    })

    test('patchedRequireWrapper', async () => {
        const patched = {__originalRequire: 'original'}
        const runPatched = patchedRequireWrapper(patched)
        expect(Module.prototype.require).not.toBe(patched)
        const result = await runPatched.run(async () => {
            expect(Module.prototype.require).toBe(patched)
            return 'someValue'
        })
        expect(Module.prototype.require).toBe('original')
        expect(result).toBe('someValue')
    })
})