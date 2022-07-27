import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {
    ArgumentChoicesNotArrayError,
    ArgumentParserNotAFunctionError,
    CliArgumentsNotArrayError,
    CliOptionsNotArrayError,
    DependenciesNotArrayError,
    DuplicateDependencyError,
    MissingArgumentNameError,
    MissingDependencyNameError,
    MissingOptionFlagsError,
    OptionChoicesNotArrayError,
    OptionParserNotAFunctionError,
    RunFunctionNotExportedError,
    RunIsNotAFunctionError,
} from '../../runner/errors.js'

describe('errors', () => {

    test('ScriptError', async () => {
        const {ScriptError} = await import('../../runner/errors.js')

        const error = new ScriptError('someMessage', 2042)
        expect(error.errorCode).toBe(2042)
        expect(error.message).toBe(`someMessage`)
    })

    test('LoadingError', async () => {
        const {LoadingError} = await import('../../runner/errors')

        const error = new LoadingError('somePath','someMessage')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': someMessage`)
    })

    test('RunningError', async () => {
        const {RunningError} = await import('../../runner/errors')

        const error = new RunningError('somePath','someMessage')
        expect(error.errorCode).toBe(1)
        expect(error.message).toBe(`Error while running 'somePath': someMessage`)
    })

    test('RunFunctionNotExportedError', async () => {
        const {RunFunctionNotExportedError} = await import('../../runner/errors')

        const error = new RunFunctionNotExportedError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': run function is not exported`)
    })

    test('RunIsNotAFunctionError', async () => {
        const {RunIsNotAFunctionError} = await import('../../runner/errors')

        const error = new RunIsNotAFunctionError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': run is not a function`)
    })

    test('CliArgumentsNotArrayError', async () => {
        const {CliArgumentsNotArrayError} = await import('../../runner/errors')

        const error = new CliArgumentsNotArrayError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': cli.arguments is not an Array`)
    })

    test('MissingArgumentNameError', async () => {
        const {MissingArgumentNameError} = await import('../../runner/errors')

        const error = new MissingArgumentNameError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': all arguments must have a "name" field`)
    })

    test('ArgumentChoicesNotArrayError', async () => {
        const {ArgumentChoicesNotArrayError} = await import('../../runner/errors')

        const error = new ArgumentChoicesNotArrayError('somePath', 'arg1')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': choices of argument "arg1" must be an Array of strings`)
    })

    test('ArgumentParserNotAFunctionError', async () => {
        const {ArgumentParserNotAFunctionError} = await import('../../runner/errors')

        const error = new ArgumentParserNotAFunctionError('somePath', 'arg1')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': parser of argument "arg1" must be a Function`)
    })

    test('CliOptionsNotArrayError', async () => {
        const {CliOptionsNotArrayError} = await import('../../runner/errors')

        const error = new CliOptionsNotArrayError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': cli.options is not an Array`)
    })

    test('MissingOptionFlagsError', async () => {
        const {MissingOptionFlagsError} = await import('../../runner/errors')

        const error = new MissingOptionFlagsError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': all options must have a "flags" field`)
    })

    test('OptionChoicesNotArrayError', async () => {
        const {OptionChoicesNotArrayError} = await import('../../runner/errors')

        const error = new OptionChoicesNotArrayError('somePath', 'opt1')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': choices of option "opt1" must be an Array of strings`)
    })

    test('OptionParserNotAFunctionError', async () => {
        const {OptionParserNotAFunctionError} = await import('../../runner/errors')

        const error = new OptionParserNotAFunctionError('somePath', 'opt1')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': parser of option "opt1" must be a Function`)
    })

    test('DependenciesNotArrayError', async () => {
        const {DependenciesNotArrayError} = await import('../../runner/errors')

        const error = new DependenciesNotArrayError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': deps is not an Array`)
    })

    test('MissingDependencyNameError', async () => {
        const {MissingDependencyNameError} = await import('../../runner/errors')

        const error = new MissingDependencyNameError('somePath')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': dependencies must have a "name" field`)
    })

    test('DuplicateDependencyError', async () => {
        const {DuplicateDependencyError} = await import('../../runner/errors')

        const error = new DuplicateDependencyError('somePath', 'dep1')
        expect(error.errorCode).toBe(2)
        expect(error.message).toBe(`Error while loading 'somePath': dependency "dep1" has been imported multiple times without different aliases`)
    })

    test.each([
        ['', -1, ''],
        ['/somePath/someFile.js:12093\nadditional\n\n\ninfo on multiple\nlines\n', 12093, 'additional\ninfo on multiple\nlines']
    ])('parseSyntaxError', async (additionalText, expectedLine, expectedDetails) => {
        const {parseSyntaxError} = await import('../../runner/errors')
        let error
        try {
            eval('const asd = +++++;\n console.log(\'asd: \' + asd)')
        } catch (e) {
            error = e
            error.stack = additionalText + error.stack
        }
        expect(parseSyntaxError(error)).toStrictEqual({
            line: expectedLine,
            message: 'SyntaxError: Unexpected token \';\'',
            details: expectedDetails
        })
    })
})