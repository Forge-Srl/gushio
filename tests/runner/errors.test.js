describe('errors', () => {

    test('ScriptError', () => {
        const {ScriptError} = require('../../runner/errors')

        const error = new ScriptError('someMessage', 2042)
        expect(error.errorCode).toBe(2042)
        expect(error.message).toBe(`someMessage`)
    })

    test('LoadingError', () => {
        const {LoadingError} = require('../../runner/errors')

        const error = new LoadingError('somePath','someMessage')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': someMessage`)
    })

    test('RunningError', () => {
        const {RunningError} = require('../../runner/errors')

        const error = new RunningError('somePath','someMessage')
        expect(error.errorCode).toBe(1)
        expect(error.message).toBe(`Error while running 'somePath': someMessage`)
    })

    test('parseSyntaxError', () => {
        const {parseSyntaxError} = require('../../runner/errors')
        let error
        try {
            eval('const asd = +++++;\n console.log(\'asd: \' + asd)')
        } catch (e) {
            error = e
            error.stack = '/somePath/someFile.js:12093\nadditional\n\n\ninfo on multiple\nlines\n' + error.stack
        }
        expect(parseSyntaxError(error)).toStrictEqual({
            line: 12093,
            message: 'SyntaxError: Unexpected token \';\'',
            details: 'additional\ninfo on multiple\nlines'
        })
    })
})