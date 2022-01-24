describe('runUtils', () => {
    let createRun, shelljs, parseCommandLineArgsAndOpts

    beforeEach(() => {
        jest.mock('shelljs')
        shelljs = require('shelljs')

        jest.mock('../../utils/parsingUtils')
        parseCommandLineArgsAndOpts = require('../../utils/parsingUtils').parseCommandLineArgsAndOpts

        createRun = require('../../utils/runUtils').createRun
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