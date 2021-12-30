describe('cliProgram', () => {
    let program, Program, path, Command, Option, Runner, GushioConsole, packageInfo, RunningError, LoadingError

    beforeEach(() => {
        jest.mock('path')
        path = require('path')
        jest.mock('commander')
        Command = require('commander').Command
        Option = require('commander').Option
        jest.mock('../../runner/Runner')
        Runner = require('../../runner/Runner').Runner
        jest.mock('../../runner/GushioConsole')
        GushioConsole = require('../../runner/GushioConsole').GushioConsole

        packageInfo = require('../../package.json')
        RunningError = require('../../runner/errors').RunningError
        LoadingError = require('../../runner/errors').LoadingError

        Program = require('../../cli/cliProgram').Program
        program = new Program(process.stdin, process.stdout, process.stderr)
    })

    test('buildConsole', () => {
        const console = {my: 'console'}
        GushioConsole.mockImplementationOnce(() => console)
        expect(program.buildConsole('logLevel')).toBe(console)
        expect(GushioConsole).toHaveBeenCalledWith(program.stdin, program.stdout, program.stderr, 'logLevel')
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
                        return {opt: 'verboseOption'}
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
                                return {opt: 'gushioFolderOption'}
                            }
                        }
                    }
                }
            })
            .mockImplementationOnce((flag, description) => {
                expect(flag).toBe('-c, --clean-run')
                expect(description).toBe('clear gushio cache folder before run (dependencies will be re-downloaded)')
                return {opt: 'cleanRunOption'}
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
        expect(commandObj.addOption).toHaveBeenCalledTimes(3)
        expect(commandObj.addOption).toHaveBeenNthCalledWith(1, {opt: 'verboseOption'})
        expect(commandObj.addOption).toHaveBeenNthCalledWith(2, {opt: 'gushioFolderOption'})
        expect(commandObj.addOption).toHaveBeenNthCalledWith(3, {opt: 'cleanRunOption'})
        expect(commandObj.action).toHaveBeenCalledWith('action')
    })


    describe('commandAction', () => {
        let action, run, console

        beforeEach(() => {
            action = program.commandAction('workingDir')
            run = jest.fn()
            console = {}
            program.buildConsole = (logLevel) => {
                expect(logLevel).toBe('verbose')
                return console
            }

            Runner.fromPath = (app, script, workingDir, gushioFolder) => {
                expect(app).toBe('gushioApp')
                expect(script).toBe('someScript')
                expect(workingDir).toBe('workingDir')
                expect(gushioFolder).toBe('gushio')
                const runner = {
                    run,
                    setConsole: console1 => {
                        expect(console1).toBe(console)
                        return runner
                    },
                    setOptions: options => {
                        expect(options).toStrictEqual({cleanRun: 'cleanRun'})
                        return runner
                    }
                }
                return runner
            }
        })

        test('success', async () => {
            await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', gushioFolder: 'gushio'}, {
                rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                args: ['someScript', 'someArgs']
            })
            expect(run).toHaveBeenCalledWith(['someArgs'])
        })

        test('failure RunningError', async () => {
            const error = new RunningError('file', 'boom')
            run.mockImplementationOnce(() => {throw error})
            console.error = jest.fn()
            try {
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith('[Gushio] %s', error.message)
        })

        test('failure LoadingError', async () => {
            const error = new LoadingError('file', 'boom')
            run.mockImplementationOnce(() => {throw error})
            console.error = jest.fn()
            try {
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith('[Gushio] %s', error.message)
        })

        test('failure generic Error', async () => {
            const error = new Error('boom')
            run.mockImplementationOnce(() => {throw error})
            console.error = jest.fn()
            try {
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith('[Gushio] %s', error.stack)
        })
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

            expect(await program.start('path', 'argv')).toBe(error.errorCode)
        })
    })
})