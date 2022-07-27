import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import path from 'path'
import os from 'os'
import {createRequire} from 'module'
import {GushioScriptLogFormat} from '../../runner/GushioConsole.js'
const require = createRequire(import.meta.url)

describe('cliProgram', () => {
    let program, Program, Command, Option, Runner, GushioConsole, GushioScriptLogFormat, packageInfo,
        RunningError, LoadingError

    beforeEach(async () => {
        Command = jest.fn()
        Option = jest.fn()
        jest.unstable_mockModule('commander', () => ({Command, Option}))
        Runner = jest.fn()
        jest.unstable_mockModule('../../runner/Runner.js', () => ({Runner}))
        GushioConsole = jest.fn()
        GushioScriptLogFormat = 'GUSHIO_FORMAT'
        jest.unstable_mockModule('../../runner/GushioConsole.js', () => ({GushioConsole, GushioScriptLogFormat}))

        RunningError = (await import('../../runner/errors.js')).RunningError
        LoadingError = (await import('../../runner/errors.js')).LoadingError

        packageInfo = require('../../package.json')

        Program = (await import('../../cli/cliProgram.js')).Program
        program = new Program(process.stdin, process.stdout, process.stderr)
    })

    test('buildConsole', () => {
        const console = {my: 'console'}
        GushioConsole.mockImplementationOnce(() => console)
        expect(program.buildConsole('logLevel', 'trace')).toBe(console)
        expect(GushioConsole).toHaveBeenCalledWith(program.stdin, program.stdout, program.stderr, 'logLevel', 'trace')
    })

    test('getCommand', () => {
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
        commandObj.addHelpText = jest.fn().mockImplementationOnce(() => commandObj)

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
                expect(flag).toBe('--trace')
                expect(description).toBe('enable instructions tracing')
                return {
                    env: env => {
                        expect(env).toBe('GUSHIO_TRACE')
                        return {opt: 'traceOption'}
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
        expect(commandObj.addHelpText).toHaveBeenNthCalledWith(1, 'after', '\ngushio is provided under MIT license.\nFor more info see: https://forge-srl.github.io/gushio')
        expect(commandObj.passThroughOptions).toHaveBeenCalled()
        expect(commandObj.argument).toHaveBeenNthCalledWith(1, '<script>', 'path to the script')
        expect(commandObj.addOption).toHaveBeenCalledTimes(4)
        expect(commandObj.addOption).toHaveBeenNthCalledWith(1, {opt: 'verboseOption'})
        expect(commandObj.addOption).toHaveBeenNthCalledWith(2, {opt: 'traceOption'})
        expect(commandObj.addOption).toHaveBeenNthCalledWith(3, {opt: 'gushioFolderOption'})
        expect(commandObj.addOption).toHaveBeenNthCalledWith(4, {opt: 'cleanRunOption'})
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

            Runner.fromPath = (app, script, workingDir, gushioFolder, trace) => {
                expect(app).toBe('gushioApp')
                expect(script).toBe('someScript')
                expect(workingDir).toBe('workingDir')
                expect(gushioFolder).toBe('gushio')
                expect(trace).toBe('trace')
                const runner = {
                    run,
                    setGushioConsole: console1 => {
                        expect(console1).toBe(console)
                        return runner
                    },
                    setGushioOptions: options => {
                        expect(options).toStrictEqual({cleanRun: 'cleanRun', trace: 'trace'})
                        return runner
                    }
                }
                return runner
            }
        })

        test('success', async () => {
            await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', trace: 'trace', gushioFolder: 'gushio'}, {
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
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', trace: 'trace', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith(GushioScriptLogFormat, error.message)
        })

        test('failure LoadingError', async () => {
            const error = new LoadingError('file', 'boom')
            run.mockImplementationOnce(() => {throw error})
            console.error = jest.fn()
            try {
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', trace: 'trace', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith(GushioScriptLogFormat, error.message)
        })

        test('failure generic Error', async () => {
            const error = new Error('boom')
            run.mockImplementationOnce(() => {throw error})
            console.error = jest.fn()
            try {
                await action('someScript', {verbose: 'verbose', cleanRun: 'cleanRun', trace: 'trace', gushioFolder: 'gushio'}, {
                    rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                    args: ['someScript', 'someArgs']
                })
            } catch (e) {
                expect(e).toBe(error)
            }

            expect(run).toHaveBeenCalledWith(['someArgs'])
            expect(console.error).toHaveBeenCalledWith(GushioScriptLogFormat, error.stack)
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