describe('cliProgram', () => {
    let program, Program, path, Command, Option, Runner, packageInfo

    beforeEach(() => {
        jest.resetModules()

        jest.mock('path')
        path = require('path')
        jest.mock('commander')
        Command = require('commander').Command
        Option = require('commander').Option
        jest.mock('../../runner/Runner')
        Runner = require('../../runner/Runner').Runner

        packageInfo = require('../../package.json')

        Program = require('../../cli/cliProgram').Program
        program = new Program('myLogger')
    })

    test('getCommand', () => {
        const commandObj = {}
        Command.mockImplementationOnce(() => commandObj)
        commandObj.name = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.description = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.version = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.argument = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.addOption = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.action = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.enablePositionalOptions = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.passThroughOptions = jest.fn().mockImplementationOnce(() => commandObj)

        Option.mockImplementationOnce((flag, description) => {
            expect(flag).toBe('-v, --verbose')
            expect(description).toBe('enable verbose logging')
            return {
                env: env => {
                    expect(env).toBe('GUSHIO_VERBOSE')
                    return 'verboseOption'
                }
            }
        })

        program.commandAction = workingDir => {
            expect(workingDir).toBe('workingDir')
            return 'action'
        }

        expect(program.getCommand('workingDir')).toBe(commandObj)
        expect(commandObj.name).toHaveBeenCalledWith(packageInfo.name)
        expect(commandObj.description).toHaveBeenCalledWith(packageInfo.description)
        expect(commandObj.enablePositionalOptions).toHaveBeenCalled()
        expect(commandObj.passThroughOptions).toHaveBeenCalled()
        expect(commandObj.argument).toHaveBeenNthCalledWith(1, '<script>', 'path to the script')
        expect(commandObj.addOption).toHaveBeenNthCalledWith(1, 'verboseOption')
        expect(commandObj.action).toHaveBeenCalledWith('action')
    })

    test('commandAction', async () => {
        const action = program.commandAction('workingDir')
        const run = jest.fn()
        path.resolve.mockImplementationOnce(() => 'absolutePath')

        Runner.fromPath = (app, script) => {
            expect(app).toBe('gushioApp')
            expect(script).toBe('absolutePath')
            const runner = {
                run,
                setLogger: logger => {
                    expect(logger).toBe('myLogger')
                    return runner
                },
                setOptions: options => {
                    expect(options).toStrictEqual({verboseLogging: 'verbose'})
                    return runner
                }
            }
            return runner
        }
        await action('someScript', {verbose: 'verbose'}, {
            rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
            args: ['someScript', 'someArgs']
        })
        expect(path.resolve).toHaveBeenCalledWith('workingDir', 'someScript')
        expect(run).toHaveBeenCalledWith('workingDir', ['someArgs'])
    })

    describe('start', () => {
        test('success', async () => {
            program.getCommand = cwd => {
                expect(cwd).toBe('path')
                return {
                    parseAsync: async argv => {
                        expect(argv).toBe('argv')
                    }
                }
            }

            expect(await program.start('path', 'argv')).toBe(0)
        })

        test('failure', async () => {
            program.getCommand = cwd => {
                expect(cwd).toBe('path')
                return {
                    parseAsync: async argv => {
                        expect(argv).toBe('argv')
                        const error = new Error('kaboom')
                        error.errorCode = 42
                        throw error
                    }
                }
            }
            program.logger = {
                error: jest.fn()
            }

            expect(await program.start('path', 'argv')).toBe(42)
            expect(program.logger.error).toHaveBeenCalledWith('kaboom')
        })
    })
})