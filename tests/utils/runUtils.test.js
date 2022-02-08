import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('runUtils', () => {
    let createRun, shelljs, parseCommandLineArgsAndOpts

    beforeEach(async () => {
        shelljs = jest.fn()
        jest.unstable_mockModule('shelljs', () => ({default: shelljs}))

        parseCommandLineArgsAndOpts = jest.fn()
        jest.unstable_mockModule('../../utils/parsingUtils.js', () => ({parseCommandLineArgsAndOpts}))

        createRun = (await import('../../utils/runUtils')).createRun
    })

    describe('createRun', () => {
        const scriptPath = 'scriptPath'
        const dir = 'currentDir'
        let buildRunner, run, runFn

        beforeEach(() => {
            runFn = jest.fn()
            buildRunner = jest.fn().mockImplementationOnce(() => ({run: runFn}))
            shelljs.pwd = () => dir
            run = createRun(buildRunner)
        })

        test.each([
            [[], []],
            [undefined, []],
            [['arg1', 'arg2'], ['arg1', 'arg2']]
        ])('array args %p', async (args, expectedArgs) => {
            await run(scriptPath, args)
            expect(buildRunner).toHaveBeenCalledWith(scriptPath, dir)
            expect(parseCommandLineArgsAndOpts).not.toHaveBeenCalled()
            expect(runFn).toHaveBeenCalledWith(expectedArgs)
        })

        test.each([
            'args as string',
            String('args as string obj')
        ])('string args %p', async (argsString) => {
            parseCommandLineArgsAndOpts.mockImplementationOnce(() => ['parsed', 'args'])
            await run(scriptPath, argsString)
            expect(buildRunner).toHaveBeenCalledWith(scriptPath, dir)
            expect(parseCommandLineArgsAndOpts).toHaveBeenCalledWith(argsString)
            expect(runFn).toHaveBeenCalledWith(['parsed', 'args'])
        })

        test.each([
            null,
            123,
            {some: 'value'}
        ])('invalid args %p', async (args) => {
            await expect(async () => await run(scriptPath, args)).rejects
                .toThrow(new Error('argsAndOpts parameter is neither a string nor an array of strings'))
            expect(buildRunner).toHaveBeenCalledWith(scriptPath, dir)
        })
    })
})