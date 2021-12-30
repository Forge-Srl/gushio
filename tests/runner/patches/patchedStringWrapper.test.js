describe('patchedStringWrapper', () => {
    let patchedStringWrapper, colors

    beforeEach(() => {
        colors = require('ansi-colors')
        patchedStringWrapper = require('../../../runner/patches/patchedStringWrapper').patchedStringWrapper
    })

    test.each([
        'red', 'blue', 'bgBlack', 'dim', 'italic'
    ])('patchedStringWrapper allowed property %s', async (prop) => {
        const fn = async () => {
            expect(String.prototype[prop]).not.toBeUndefined()
            expect('some value'[prop]).toBe(colors[prop]('some value'))
            return 'something'
        }
        expect(String.prototype[prop]).toBeUndefined()
        expect(await patchedStringWrapper().run(fn)).toBe('something')
        expect(String.prototype[prop]).toBeUndefined()
    })

    test('patchedStringWrapper not allowed properties', async () => {
        const fn = async () => {
            expect(String.prototype.theme).toBeUndefined()
            expect(String.prototype.alias).toBeUndefined()
            return 'something'
        }
        expect(String.prototype.theme).toBeUndefined()
        expect(String.prototype.alias).toBeUndefined()
        expect(await patchedStringWrapper().run(fn)).toBe('something')
        expect(String.prototype.theme).toBeUndefined()
        expect(String.prototype.alias).toBeUndefined()
    })
})