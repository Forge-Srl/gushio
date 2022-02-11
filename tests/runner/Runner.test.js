import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('Runner', () => {
    let Runner, LoadingError, RunningError, parseSyntaxError, ScriptChecker, dependenciesUtils,
        patchedStringWrapper, patchedConsoleWrapper, fetchWrapper, YAMLWrapper, fileSystemWrapper, gushioWrapper,
        FunctionWrapper, Command, Argument, Option, mockedPath

    beforeEach(async () => {
        mockedPath = jest.fn()
        jest.unstable_mockModule('path', () => ({default: mockedPath}))

        ScriptChecker = jest.fn()
        jest.unstable_mockModule('../../runner/ScriptChecker.js', () => ({ScriptChecker}))

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
        const scriptObject = {
            cli: {
                arguments: ['arg1', 'arg2'],
                options: ['opt1', 'opt2'],
            },
            run: 'run',
            deps: ['dep1', 'dep2']
        }
        const checkScriptObject = jest.fn()
        ScriptChecker.mockImplementationOnce(path => {
            expect(path).toBe(scriptPath)
            return {checkScriptObject}
        })

        expect(Runner.fromJsonObject('appPath', scriptPath, scriptObject))
            .toStrictEqual(new Runner('appPath', scriptPath, scriptObject.run, scriptObject.cli, scriptObject.deps))
        expect(checkScriptObject).toHaveBeenCalledWith(scriptObject)
    })

    test('constructor', () => {
        expect(new Runner('app', 'script', 'func'))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: [], options: []}, []))
        expect(new Runner('app', 'script', 'func', undefined, ['dep1']))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: [], options: []}, ['dep1']))
        expect(new Runner('app', 'script', 'func', {}))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: [], options: []}, []))
        expect(new Runner('app', 'script', 'func', {arguments: ['arg']}))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: ['arg'], options: []}, []))
        expect(new Runner('app', 'script', 'func', {options: ['opt']}))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: [], options: ['opt']}, []))
        expect(new Runner('app', 'script', 'func', {arguments: ['arg'], options: ['opt']}))
            .toStrictEqual(new Runner('app', 'script', 'func', {arguments: ['arg'], options: ['opt']}, []))
    })

    test('getDependenciesVersionsAndNames', () => {
        dependenciesUtils.dependencyDescriptor
            .mockImplementation((name, version, alias) => ({name, npmInstallVersion: version + alias}))

        const runner = new Runner('appPath', 'scriptPath', 'run', undefined, [
            {name: 'name1', version: 'version1', alias: 'alias1'},
            {name: 'name2', version: 'version2', alias: 'alias2'},
            {name: 'name3', version: 'version3', alias: 'alias3'},
        ])

        expect(runner.getDependenciesVersionsAndNames()).toStrictEqual({
            names: ['name1', 'name2', 'name3'],
            versions: ['version1alias1', 'version2alias2', 'version3alias3']
        })
    })

    test('setOptions', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.options).toBeUndefined()
        expect(runner.setOptions('options')).toBe(runner)
        expect(runner.options).toBe('options')
    })

    test('setConsole', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.console).toBeUndefined()
        expect(runner.setConsole('console')).toBe(runner)
        expect(runner.console).toBe('console')
    })

    test('similarRunnerFromPath', async () => {
        const runner = new Runner('appPath', 'scriptPath', 'run', undefined, undefined, 'gushioPath')
        runner.console = 'console'
        runner.options = 'options'

        const fakeRunner = {
            setConsole: jest.fn().mockImplementationOnce(() => fakeRunner),
            setOptions: jest.fn().mockImplementationOnce(() => fakeRunner),
        }

        Runner.fromPath = (application, scriptPath, workingDir, gushioGeneralPath) => {
            expect(application).toBe(runner.application)
            expect(scriptPath).toBe('newPath')
            expect(workingDir).toBe('newDir')
            expect(gushioGeneralPath).toBe(runner.gushioGeneralPath)
            return fakeRunner
        }

        expect(await runner.similarRunnerFromPath('newPath', 'newDir')).toBe(fakeRunner)
        expect(fakeRunner.setConsole).toHaveBeenCalledWith(runner.console)
        expect(fakeRunner.setOptions).toHaveBeenCalledWith(runner.options)
    })

    test.each([
        [{name: 'script name', version: 'my super   duper\tversion'}, '0d858590-script_name-my_super_duper_version'],
        [{version: 'my super   duper\tversion'}, '0d858590-my_super_duper_version'],
        [{name: 'script name'}, '0d858590-script_name'],
        [{}, '0d858590'],
    ])('gushioFolder', async (cli, expected) => {
        mockedPath.resolve = jest.fn().mockImplementationOnce(() => 'resolved_folder')
        const runner = new Runner('appPath', 'scriptPath', 'run', cli, undefined, 'fake_folder')

        expect(runner.gushioFolder).toBe('resolved_folder')
        expect(mockedPath.resolve).toHaveBeenCalledWith('fake_folder', expected)
        // Call again to check caching
        expect(runner.gushioFolder).toBe('resolved_folder')
        expect(mockedPath.resolve).toHaveBeenCalledTimes(1)
    })

    describe('installDependency', () => {
        let runner

        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath', 'run')
            runner.console = {info: jest.fn(), isVerbose: true}
        })

        test('already installed', async () => {
            await runner.installDependency('somePath', 'dep')
            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio] %s', 'Installing dependency dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).not.toHaveBeenCalled()
            expect(runner.console.info).toHaveBeenNthCalledWith(2, '[Gushio] %s', 'Dependency dep already installed')
        })

        test('missing dependency', async () => {
            dependenciesUtils.checkDependencyInstalled.mockRejectedValueOnce(new Error('kaboom'))

            await runner.installDependency('somePath', 'dep')
            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio] %s', 'Installing dependency dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(runner.console.info).toHaveBeenNthCalledWith(2, '[Gushio] %s', 'Dependency dep successfully installed')
        })
    })

    describe('getCommandPreActionHook', () => {
        let runner
        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath', 'run')
            runner.console = {info: jest.fn()}
            runner.options = {cleanRun: true}
            runner.installDependency = jest.fn()
        })

        test('no dependencies', async () => {
            const hook = runner.getCommandPreActionHook([])
            await hook()

            expect(runner.console.info).not.toHaveBeenCalled()
            expect(dependenciesUtils.ensureNodeModulesExists).not.toHaveBeenCalled()
        })

        test('with dependencies', async () => {
            runner._gushioFolder = 'gushioFolder'
            const hook = runner.getCommandPreActionHook(['dep1', 'dep2'])
            await hook()

            expect(runner.console.info).toHaveBeenNthCalledWith(1, '[Gushio] %s', 'Checking dependencies')
            expect(dependenciesUtils.ensureNodeModulesExists).toHaveBeenCalledWith('gushioFolder', runner.options.cleanRun)
            expect(runner.installDependency).toHaveBeenNthCalledWith(1, 'gushioFolder', 'dep1')
            expect(runner.installDependency).toHaveBeenNthCalledWith(2, 'gushioFolder', 'dep2')
        })
    })

    test('buildCombinedFunctionWrapper', () => {
        const runner = new Runner('appPath', 'scriptPath')
        runner.console = {verbose: jest.fn(), isVerbose: true}
        runner._gushioFolder = 'someFolder'

        dependenciesUtils.buildPatchedImport.mockImplementationOnce((path, allowedDeps) => {
            expect(path).toBe('someFolder')
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
        gushioWrapper.mockImplementationOnce((buildRunner) => {
            runner.similarRunnerFromPath = jest.fn()
            buildRunner('script', 'directory')
            expect(runner.similarRunnerFromPath).toHaveBeenCalledWith('script', 'directory')
            return 'gushioWrapper'
        })
        FunctionWrapper.combine = (...runners) => {
            expect(runners).toStrictEqual([
                'patchedStringWrapper', 'patchedConsoleWrapper', 'fetchWrapper',
                'YAMLWrapper', 'fileSystemWrapper', 'gushioWrapper'
            ])
            return 'combined'
        }

        expect(runner.buildCombinedFunctionWrapper(['dep1', 'dep2'])).toBe('combined')
    })

    describe('getCommandAction', () => {
        let func, runner, action
        beforeEach(() => {
            func = jest.fn()
            runner = new Runner('appPath', 'scriptPath', func)
            runner.console = {verbose: jest.fn(), isVerbose: true}
            runner._gushioFolder = 'someFolder'
            runner.buildCombinedFunctionWrapper = (dependencies) => {
                expect(dependencies).toStrictEqual(['shelljs', 'dep1', 'dep2'])
                return {
                    run: async (func) => await func()
                }
            }
            action = runner.getCommandAction(['dep1', 'dep2'])
        })

        test('function ok', async () => {
            await action('arg1', 'arg2', 'arg3', 'cliOptions', 'command')

            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(1, '[Gushio] %s', 'Running with arguments ["arg1","arg2","arg3"]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(2, '[Gushio] %s', 'Running with options "cliOptions"')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(3, '[Gushio] %s', 'Running with dependencies ["shelljs","dep1","dep2"] in someFolder')

            expect(func).toHaveBeenCalledWith(['arg1', 'arg2', 'arg3'], 'cliOptions')
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
            await expect(async () => await action('arg1', 'arg2', 'arg3', 'cliOptions', 'command')).rejects
                .toThrow(new Error('boom'))

            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(1, '[Gushio] %s', 'Running with arguments ["arg1","arg2","arg3"]')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(2, '[Gushio] %s', 'Running with options "cliOptions"')
            expect(runner.console.verbose)
                .toHaveBeenNthCalledWith(3, '[Gushio] %s', 'Running with dependencies ["shelljs","dep1","dep2"] in someFolder')

            expect(func).toHaveBeenCalledWith(['arg1', 'arg2', 'arg3'], 'cliOptions')
        })
    })

    test('makeCommand', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run', {
            description: 'appDesc',
            version: 'version',
            afterHelp: 'Custom after help',
            arguments: [
                {name: 'name1', description: 'desc1', default: 'def1'},
                {name: 'name2', description: 'desc2', choices: ['c1', 'c2']},
            ],
            options: [
                {flags: 'flag1', description: 'desc_flag1', default: 'def_flag1', env: 'SOME_ENV_VAR'},
                {flags: 'flag2', description: 'desc_flag2', choices: ['f1', 'f2', 'f3']},
            ]
        })
        runner.getDependenciesVersionsAndNames = () => ({versions: 'versions', names: 'names'})
        runner.getCommandPreActionHook = (versions) => {
            expect(versions).toBe('versions')
            return 'hook'
        }
        runner.getCommandAction = (names) => {
            expect(names).toBe('names')
            return 'action'
        }

        const command = {
            name: name => {
                expect(name).toBe('scriptPath')
                return command
            },
            description: description => {
                expect(description).toBe('appDesc')
                return command
            },
            version: version => {
                expect(version).toBe('version')
                return command
            },
            showSuggestionAfterError: jest.fn().mockImplementationOnce(() => command),
            addArgument: jest.fn(),
            addOption: jest.fn(),
            addHelpText: jest.fn(),
            hook: (event, hook) => {
                expect(event).toBe('preAction')
                expect(hook).toBe('hook')
                return command
            },
            action: (action) => {
                expect(action).toBe('action')
                return command
            }
        }

        const argCapture = class {
            constructor(value = {}) {
                this.value = value
            }

            default(def) {
                this.value.default = def
                return this
            }

            choices(choices) {
                this.value.choices = choices
                return this
            }
        }
        const optCapture = class {
            constructor(value = {}) {
                this.value = value
            }

            default(def) {
                this.value.default = def
                return this
            }

            choices(choices) {
                this.value.choices = choices
                return this
            }

            env(env) {
                this.value.env = env
                return this
            }
        }

        Command.mockImplementationOnce(() => command)
        Argument.mockImplementation((name, description) => new argCapture({name, description}))
        Option.mockImplementation((flags, description) => new optCapture({flags, description}))

        expect(runner.makeCommand('somePath')).toBe(command)
        expect(command.showSuggestionAfterError).toHaveBeenCalled()
        expect(command.addHelpText).toHaveBeenCalledWith('after', '\nCustom after help')
        expect(command.addArgument).toHaveBeenNthCalledWith(1, new argCapture({name: 'name1', description: 'desc1', default: 'def1'}))
        expect(command.addArgument).toHaveBeenNthCalledWith(2, new argCapture({name: 'name2', description: 'desc2', choices: ['c1', 'c2']}))
        expect(command.addOption).toHaveBeenNthCalledWith(1, new optCapture({flags: 'flag1', description: 'desc_flag1', default: 'def_flag1', env: 'SOME_ENV_VAR'}))
        expect(command.addOption).toHaveBeenNthCalledWith(2, new optCapture({flags: 'flag2', description: 'desc_flag2', choices: ['f1', 'f2', 'f3']}))
    })

    describe('run', () => {
        test('failure', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            runner.makeCommand = () => ({
                parseAsync: jest.fn().mockRejectedValueOnce(new Error('kaboom!!!'))
            })
            await expect(async () => await runner.run(['arg1', 'arg2'])).rejects.toThrow(new Error('kaboom!!!'))
        })

        test('success', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            const command = {parseAsync: jest.fn().mockResolvedValueOnce(undefined)}
            runner.makeCommand = () => command
            await runner.run(['arg1', 'arg2'])
            expect(command.parseAsync).toHaveBeenCalledWith(['appPath', 'scriptPath', 'arg1', 'arg2'])
        })
    })
})