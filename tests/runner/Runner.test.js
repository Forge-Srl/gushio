import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('Runner', () => {
    let Runner, LoadingError, RunningError, parseSyntaxError, ScriptHandler, dependenciesUtils,
        patchedStringWrapper, patchedConsoleWrapper, fetchWrapper, YAMLWrapper, fileSystemWrapper, timerWrapper,
        gushioWrapper, FunctionWrapper, Command, Argument, Option, mockedPath

    beforeEach(async () => {
        mockedPath = jest.fn()
        jest.unstable_mockModule('path', () => ({default: mockedPath}))

        ScriptHandler = jest.fn()
        jest.unstable_mockModule('../../runner/ScriptHandler.js', () => ({ScriptHandler}))

        dependenciesUtils = {
            buildPatchedImport: jest.fn(),
            checkDependencyInstalled: jest.fn(),
            dependencyDescriptor: jest.fn(),
            ensureNodeModulesExists: jest.fn(),
            installDependency: jest.fn(),
            requireStrategy: jest.fn(),
        }
        jest.unstable_mockModule('../../utils/dependenciesUtils.js', () => dependenciesUtils)

        patchedStringWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/patchedStringWrapper.js', () => ({patchedStringWrapper}))
        patchedConsoleWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/patchedConsoleWrapper.js', () => ({patchedConsoleWrapper}))
        fetchWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/fetchWrapper.js', () => ({fetchWrapper}))
        YAMLWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/YAMLWrapper.js', () => ({YAMLWrapper}))
        fileSystemWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/fileSystemWrapper.js', () => ({fileSystemWrapper}))
        timerWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/timerWrapper.js', () => ({timerWrapper}))
        gushioWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/gushioWrapper.js', () => ({gushioWrapper}))

        FunctionWrapper = jest.fn()
        jest.unstable_mockModule('../../runner/patches/FunctionWrapper.js', () => ({FunctionWrapper}))

        LoadingError = jest.fn()
        RunningError = jest.fn()
        parseSyntaxError = jest.fn()
        jest.unstable_mockModule('../../runner/errors.js', () => ({LoadingError, RunningError, parseSyntaxError }))

        Command = jest.fn()
        Argument = jest.fn()
        Option = jest.fn()
        jest.unstable_mockModule('commander', () => ({Command, Argument, Option}))

        Runner = (await import('../../runner/Runner.js')).Runner
    })

    describe('fromPath', () => {
        const app = 'appPath'
        const gushioPath = 'gushio'
        const workingDir = 'workingDir'

        test.each([
            'http://someUrl',
            'https://someUrl'
        ])('Remote url %s', async (scriptPath) => {
            dependenciesUtils.requireStrategy.remotePath = 'remote strategy'
            Runner.fromRequire = (application, scriptPath1, requireStrategy, gushioGeneralPath) => {
                expect(application).toBe(app)
                expect(scriptPath1).toBe(scriptPath)
                expect(requireStrategy).toBe('remote strategy')
                expect(gushioGeneralPath).toBe(gushioPath)
                return 'runnerObj'
            }

            expect(await Runner.fromPath(app, scriptPath, workingDir, gushioPath)).toBe('runnerObj')
        })
        test.each([
            'some/local/path',
            'http/Folder/starting_with_http'
        ])('Local path %s', async (scriptPath) => {
            dependenciesUtils.requireStrategy.localPath = 'local strategy'
            mockedPath.resolve = jest.fn().mockImplementationOnce(() => 'local/dir')
            Runner.fromRequire = (application, scriptPath, requireStrategy, gushioGeneralPath) => {
                expect(application).toBe(app)
                expect(scriptPath).toBe('local/dir')
                expect(requireStrategy).toBe('local strategy')
                expect(gushioGeneralPath).toBe(gushioPath)
                return 'runnerObj'
            }

            expect(await Runner.fromPath(app, scriptPath, workingDir, gushioPath)).toBe('runnerObj')
            expect(mockedPath.resolve).toHaveBeenCalledWith(workingDir, scriptPath)
        })
    })

    describe('fromRequire', () => {
        test('invalid package', async () => {
            const scriptPath = './invalid_script_path'
            const strategy = async (path) => {
                expect(path).toBe(scriptPath)
                throw new Error('someMessage')
            }
            LoadingError.mockImplementationOnce((script, message) => {
                expect(script).toBe(scriptPath)
                expect(message).toBe('someMessage')
                return new Error('boom')
            })
            await expect(() => Runner.fromRequire('appPath', scriptPath, strategy)).rejects.toThrow(new Error('boom'))
        })

        test('syntax error', async () => {
            const mockSyntaxError = new SyntaxError('error')
            const scriptPath = './invalid_script_path'
            const strategy = async (path) => {
                expect(path).toBe(scriptPath)
                throw mockSyntaxError
            }
            parseSyntaxError.mockImplementationOnce(error => {
                expect(error).toBe(mockSyntaxError)
                return {line: 125, details: 'someDetails', message: 'someMessage'}
            })
            LoadingError.mockImplementationOnce((script, message) => {
                expect(script).toBe(scriptPath)
                expect(message).toBe('"someMessage" at line 125\nsomeDetails')
                return new Error('boom')
            })
            await expect(() => Runner.fromRequire('appPath', scriptPath, strategy)).rejects.toThrow(new Error('boom'))
        })

        test('valid package', async () => {
            const scriptPath = 'valid_script_path'
            const dummy = {someKey: 'someValue'}
            const strategy = async (path) => {
                expect(path).toBe(scriptPath)
                return dummy
            }
            Runner.fromJsonObject = (application, scriptPath, scriptObject) => {
                expect(application).toBe('appPath')
                expect(scriptPath).toBe(scriptPath)
                expect(scriptObject).toBe(dummy)
                return 'runnerObj'
            }
            expect(await Runner.fromRequire('appPath', scriptPath, strategy)).toBe('runnerObj')
        })
    })

    test('fromJsonObject', () => {
        const scriptPath = 'somePath'
        const scriptObject = 'scriptObject'
        ScriptHandler.mockImplementationOnce((path, scriptObj) => {
            expect(path).toBe(scriptPath)
            expect(scriptObj).toBe(scriptObject)
            return {handler: 123}
        })

        expect(Runner.fromJsonObject('appPath', scriptPath, scriptObject, 'generalPath'))
            .toStrictEqual(new Runner('appPath', scriptPath, {handler: 123}, 'generalPath'))
    })

    test('setOptions', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.options).toBeUndefined()
        expect(runner.setGushioOptions('options')).toBe(runner)
        expect(runner.options).toBe('options')
    })

    test('setConsole', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.console).toBeUndefined()
        expect(runner.setGushioConsole('console')).toBe(runner)
        expect(runner.console).toBe('console')
    })

    test('similarRunnerFromPath', async () => {
        const runner = new Runner('appPath', 'scriptPath', undefined, 'gushioPath')
        runner.console = 'console'
        runner.options = 'options'

        const fakeRunner = {
            setGushioConsole: jest.fn().mockImplementationOnce(() => fakeRunner),
            setGushioOptions: jest.fn().mockImplementationOnce(() => fakeRunner),
        }

        Runner.fromPath = (application, scriptPath, workingDir, gushioGeneralPath) => {
            expect(application).toBe(runner.application)
            expect(scriptPath).toBe('newPath')
            expect(workingDir).toBe('newDir')
            expect(gushioGeneralPath).toBe(runner.gushioGeneralPath)
            return fakeRunner
        }

        expect(await runner.similarRunnerFromPath('newPath', 'newDir')).toBe(fakeRunner)
        expect(fakeRunner.setGushioConsole).toHaveBeenCalledWith(runner.console)
        expect(fakeRunner.setGushioOptions).toHaveBeenCalledWith(runner.options)
    })

    describe('installDependency', () => {
        let runner

        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath')
            runner.console = {info: jest.fn(), isVerbose: true}
        })

        test('already installed', async () => {
            await runner.installDependency('somePath', 'dep')
            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'Installing dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).not.toHaveBeenCalled()
            expect(runner.console.info).toHaveBeenNthCalledWith(2, '[Gushio|Deps] %s', 'dep already installed')
        })

        test('missing dependency', async () => {
            dependenciesUtils.checkDependencyInstalled.mockRejectedValueOnce(new Error('kaboom'))

            await runner.installDependency('somePath', 'dep')
            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'Installing dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(runner.console.info).toHaveBeenNthCalledWith(2, '[Gushio|Deps] %s', 'dep successfully installed')
        })
    })

    describe('onPreActionHook', () => {
        let runner
        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath', 'run')
            runner.console = {info: jest.fn()}
            runner.options = {cleanRun: true}
            runner.installDependency = jest.fn()
        })

        test('no dependencies', async () => {
            await runner.onPreActionHook([])

            expect(runner.console.info).not.toHaveBeenCalled()
            expect(dependenciesUtils.ensureNodeModulesExists).not.toHaveBeenCalled()
        })

        test('with dependencies', async () => {
            await runner.onPreActionHook(['dep1', 'dep2'], 'gushioFolder')

            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'Checking dependencies in gushioFolder')
            expect(dependenciesUtils.ensureNodeModulesExists).toHaveBeenCalledWith('gushioFolder', runner.options.cleanRun)
            expect(runner.installDependency).toHaveBeenNthCalledWith(1, 'gushioFolder', 'dep1')
            expect(runner.installDependency).toHaveBeenNthCalledWith(2, 'gushioFolder', 'dep2')
        })
    })

    test('buildCombinedFunctionWrapper', () => {
        const runner = new Runner('appPath', 'scriptPath')
        runner.console = {verbose: jest.fn(), isVerbose: true}
        runner.options = {trace: 'trace'}

        dependenciesUtils.buildPatchedImport.mockImplementationOnce((path, allowedDeps) => {
            expect(path).toBe('gushioFolder')
            expect(allowedDeps).toStrictEqual(['dep1', 'dep2'])
            return 'patched'
        })
        patchedStringWrapper.mockImplementationOnce(() => 'patchedStringWrapper')
        patchedConsoleWrapper.mockImplementationOnce((console) => {
            expect(console).toBe(runner.console)
            return 'patchedConsoleWrapper'
        })
        fetchWrapper.mockImplementationOnce(() => 'fetchWrapper')
        YAMLWrapper.mockImplementationOnce(() => 'YAMLWrapper')
        fileSystemWrapper.mockImplementationOnce((scriptPath, isVerbose) => {
            expect(scriptPath).toBe(runner.scriptPath)
            expect(isVerbose).toBe(runner.console.isVerbose)
            return 'fileSystemWrapper'
        })
        timerWrapper.mockImplementationOnce(() => 'timerWrapper')
        gushioWrapper.mockImplementationOnce((buildRunner, patchedImport, console) => {
            expect(patchedImport).toBe('patched')
            expect(console).toBe(runner.console)
            runner.similarRunnerFromPath = jest.fn()
            buildRunner('script', 'directory')
            expect(runner.similarRunnerFromPath).toHaveBeenCalledWith('script', 'directory')
            return 'gushioWrapper'
        })
        FunctionWrapper.combine = (...runners) => {
            expect(runners).toStrictEqual([
                'patchedStringWrapper', 'patchedConsoleWrapper', 'fetchWrapper',
                'YAMLWrapper', 'fileSystemWrapper', 'timerWrapper', 'gushioWrapper'
            ])
            return 'combined'
        }

        expect(runner.buildCombinedFunctionWrapper(['dep1', 'dep2'], 'gushioFolder')).toBe('combined')
    })

    describe('onCommandAction', () => {
        let func, runner, settings
        beforeEach(() => {
            func = jest.fn()
            runner = new Runner('appPath', 'scriptPath')
            runner.console = {verbose: jest.fn(), isVerbose: true}
            runner.buildCombinedFunctionWrapper = (dependencies) => {
                expect(dependencies).toStrictEqual(['shelljs', 'dep1', 'dep2'])
                return {
                    run: async (func) => await func()
                }
            }
            settings = {
                dependencies: ['dep1', 'dep2'],
                gushioFolder: 'someFolder',
                rawArguments: ['arg1', 'arg2', 'arg3'],
                getArguments: async () => [1,2,3],
                rawOptions: {opt1: 'value1', opt2: 'value2'},
                getOptions: async () => ({opt1: 1, opt2: 2}),
                runFunction: func
            }
        })

        test('function ok', async () => {
            await runner.onCommandAction(settings)

            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(1, '[Gushio|Script] %s', 'Running with dependencies ["shelljs","dep1","dep2"] in someFolder')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(2, '[Gushio|Script] %s', 'Running with raw arguments ["arg1","arg2","arg3"]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(3, '[Gushio|Script] %s', 'Running with raw options {"opt1":"value1","opt2":"value2"}')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(4, '[Gushio|Script] %s', 'Running with parsed arguments [1,2,3]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(5, '[Gushio|Script] %s', 'Running with parsed options {"opt1":1,"opt2":2}')

            expect(func).toHaveBeenCalledWith([1,2,3], {opt1: 1, opt2: 2})
        })

        test.each([
            ['boom boom', 'boom boom'],
            [new Error('boom boom'), 'boom boom'],
            [123, undefined],
        ])('function error %p', async (error, expected) => {
            func.mockImplementationOnce(() => {throw error})
            RunningError.mockImplementationOnce((script, message) => {
                expect(script).toBe('scriptPath')
                expect(message).toBe(expected)
                return new Error('boom')
            })
            await expect(runner.onCommandAction(settings)).rejects
                .toThrow(new Error('boom'))

            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(1, '[Gushio|Script] %s', 'Running with dependencies ["shelljs","dep1","dep2"] in someFolder')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(2, '[Gushio|Script] %s', 'Running with raw arguments ["arg1","arg2","arg3"]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(3, '[Gushio|Script] %s', 'Running with raw options {"opt1":"value1","opt2":"value2"}')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(4, '[Gushio|Script] %s', 'Running with parsed arguments [1,2,3]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(5, '[Gushio|Script] %s', 'Running with parsed options {"opt1":1,"opt2":2}')

            expect(func).toHaveBeenCalledWith([1, 2, 3], {opt1: 1, opt2: 2})
        })
    })

    describe('run', () => {
        let command, runner
        beforeEach(() => {
            command = {
                parseAsync: jest.fn()
            }
            const handler = {
                toCommand: (path, preAction, action) => {
                    expect(path).toBe('general')
                    preAction('deps', 'folder')
                    action('settings')
                    return command
                }
            }
            runner = new Runner('appPath', 'scriptPath', handler, 'general')
            runner.onPreActionHook = jest.fn()
            runner.onCommandAction = jest.fn()
        })

        test('failure', async () => {
            command.parseAsync.mockRejectedValueOnce(new Error('kaboom!!!'))
            await expect(async () => await runner.run(['arg1', 'arg2'])).rejects.toThrow(new Error('kaboom!!!'))
            expect(runner.onPreActionHook).toHaveBeenCalledWith('deps', 'folder')
            expect(runner.onCommandAction).toHaveBeenCalledWith('settings')
        })

        test('success', async () => {
            command.parseAsync.mockResolvedValueOnce(undefined)
            await runner.run(['arg1', 'arg2'])
            expect(command.parseAsync).toHaveBeenCalledWith(['appPath', 'scriptPath', 'arg1', 'arg2'])
            expect(runner.onPreActionHook).toHaveBeenCalledWith('deps', 'folder')
            expect(runner.onCommandAction).toHaveBeenCalledWith('settings')
        })
    })
})