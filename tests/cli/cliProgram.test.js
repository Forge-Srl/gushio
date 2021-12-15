describe('cliProgram', () => {
    let program, Program, path, Command, Option, Runner, packageInfo, RunningError, LoadingError

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
        RunningError = require('../../runner/errors').RunningError
        LoadingError = require('../../runner/errors').LoadingError

        Program = require('../../cli/cliProgram').Program
        program = new Program('myLogger')
    })

    test('getCommand', () => {
        const path = require('path')
        const os = require('os')

        const commandObj = {}
        Command.mockImplementationOnce(() => commandObj)
        commandObj.name = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.description = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.version = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.argument = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.addOption = jest.fn().mockImplementation(() => commandObj)
        commandObj.action = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.enablePositionalOptions = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.passThroughOptions = jest.fn().mockImplementationOnce(() => commandObj)

        Option
            .mockImplementationOnce((flag, description) => {
                expect(flag).toBe('-v, --verbose')
                expect(description).toBe('enable verbose logging')
                return {
                    env: env => {
                        expect(env).toBe('GUSHIO_VERBOSE')
                        return 'verboseOption'
                    }
                }
            })
            .mockImplementationOnce((flag, description) => {
                expect(flag).toBe('-f, --gushio-folder <folder>')
                expect(description).toBe('path to the gushio cache folder')
                return {
                    env: env => {
                        expect(env).toBe('GUSHIO_FOLDER')
                        return {
                            default: (value) => {
                                expect(value).toBe(path.resolve(os.homedir(), '.gushio'))
                                return 'gushioFolderOption'
                            }
                        }
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
        expect(commandObj.addOption).toHaveBeenNthCalledWith(2, 'gushioFolderOption')
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
        expect(run).toHaveBeenCalledWith(['someArgs'])
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

        test('failure generic error', async () => {
            const error = new Error('kaboom')
            error.errorCode = 42

            program.getCommand = cwd => {
                expect(cwd).toBe('path')
                return {
                    parseAsync: async argv => {
                        expect(argv).toBe('argv')
                        throw error
                    }
                }
            }
            program.logger = {
                error: jest.fn()
            }

            expect(await program.start('path', 'argv')).toBe(error.errorCode)
            expect(program.logger.error).toHaveBeenCalledWith(error.stack)
        })

        test('failure RunningError', async () => {
            const error = new RunningError('kaboom', 'boomka')

            program.getCommand = cwd => {
                expect(cwd).toBe('path')
                return {
                    parseAsync: async argv => {
                        expect(argv).toBe('argv')
                        throw error
                    }
                }
            }
            program.logger = {
                error: jest.fn()
            }

            expect(await program.start('path', 'argv')).toBe(error.errorCode)
            expect(program.logger.error).toHaveBeenCalledWith(error.message)
        })

        test('failure LoadingError', async () => {
            const error = new LoadingError('kaboom', 'boomka')

            program.getCommand = cwd => {
                expect(cwd).toBe('path')
                return {
                    parseAsync: async argv => {
                        expect(argv).toBe('argv')
                        throw error
                    }
                }
            }
            program.logger = {
                error: jest.fn()
            }

            expect(await program.start('path', 'argv')).toBe(error.errorCode)
            expect(program.logger.error).toHaveBeenCalledWith(error.message)
        })
    })
})