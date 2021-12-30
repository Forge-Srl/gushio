describe('patchedRequireRunner', () => {
    let patchedRequireRunner, Module

    beforeEach(() => {
        Module = require('module')
        patchedRequireRunner = require('../../../runner/patches/patchedRequireRunner').patchedRequireRunner
    })

    test('patchedRequireRunner', async () => {
        const patched = {__originalRequire: 'original'}
        const runPatched = patchedRequireRunner(patched)
        expect(Module.prototype.require).not.toBe(patched)
        const result = await runPatched.run(async () => {
            expect(Module.prototype.require).toBe(patched)
            return 'someValue'
        })
        expect(Module.prototype.require).toBe('original')
        expect(result).toBe('someValue')
    })
})