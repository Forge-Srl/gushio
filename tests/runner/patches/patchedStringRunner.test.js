describe('patchedStringRunner', () => {
    let patchedStringRunner, colors

    beforeEach(() => {
        colors = require('ansi-colors')
        patchedStringRunner = require('../../../runner/patches/patchedStringRunner').patchedStringRunner
    })

    test.each([
        'red', 'blue', 'bgBlack', 'dim', 'italic'
    ])('patchedStringRunner allowed property %s', async (prop) => {
        const fn = async () => {
            expect(String.prototype[prop]).not.toBeUndefined()
            expect('some value'[prop]).toBe(colors[prop]('some value'))
            return 'something'
        }
        expect(String.prototype[prop]).toBeUndefined()
        expect(await patchedStringRunner().run(fn)).toBe('something')
        expect(String.prototype[prop]).toBeUndefined()
    })

    test('patchedStringRunner not allowed properties', async () => {
        const fn = async () => {
            expect(String.prototype.theme).toBeUndefined()
            expect(String.prototype.alias).toBeUndefined()
            return 'something'
        }
        expect(String.prototype.theme).toBeUndefined()
        expect(String.prototype.alias).toBeUndefined()
        expect(await patchedStringRunner().run(fn)).toBe('something')
        expect(String.prototype.theme).toBeUndefined()
        expect(String.prototype.alias).toBeUndefined()
    })
})