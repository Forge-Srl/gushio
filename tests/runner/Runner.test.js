describe('Runner', () => {
    let Runner, LoadingError, RunningError, parseSyntaxError, ScriptChecker, dependenciesUtils, Command, Argument, Option

    beforeEach(() => {
        jest.resetModules()

        jest.mock('../../runner/ScriptChecker')
        ScriptChecker = require('../../runner/ScriptChecker').ScriptChecker

        jest.mock('../../utils/dependenciesUtils')
        dependenciesUtils = require('../../utils/dependenciesUtils')

        jest.mock('../../runner/errors')
        LoadingError = require('../../runner/errors').LoadingError
        RunningError = require('../../runner/errors').RunningError
        parseSyntaxError = require('../../runner/errors').parseSyntaxError

        jest.mock('commander')
        Command = require('commander').Command
        Argument = require('commander').Argument
        Option = require('commander').Option

        Runner = require('../../runner/Runner').Runner
    })

    describe('fromPath', () => {
        test('invalid package', () => {
            const scriptPath = './invalid_script_path'
            LoadingError.mockImplementationOnce((script, message) => {
                expect(script).toBe(scriptPath)
                expect(message).toBe('file not found')
                return new Error('boom')
            })
            expect(() => Runner.fromPath('appPath', scriptPath)).toThrow(new Error('boom'))
        })

        test('syntax error', () => {
            const mockSyntaxError = new SyntaxError('error')
            jest.mock('valid_script_path', () => {throw mockSyntaxError}, { virtual: true })
            parseSyntaxError.mockImplementationOnce(error => {
                expect(error).toBe(mockSyntaxError)
                return {line: 125, details: 'someDetails', message: 'someMessage'}
            })
            LoadingError.mockImplementationOnce((script, message) => {
                expect(script).toBe('valid_script_path')
                expect(message).toBe('"someMessage" at line 125\nsomeDetails')
                return new Error('boom')
            })
            expect(() => Runner.fromPath('appPath', 'valid_script_path')).toThrow(new Error('boom'))
        })

        test('valid package', () => {
            jest.mock('valid_script_path', () => ({someKey: 'someValue'}), { virtual: true })
            const dummy = require('valid_script_path')
            Runner.fromJsonObject = (application, scriptPath, scriptObject) => {
                expect(application).toBe('appPath')
                expect(scriptPath).toBe('valid_script_path')
                expect(scriptObject).toBe(dummy)
                return 'runnerObj'
            }
            expect(Runner.fromPath('appPath', 'valid_script_path')).toBe('runnerObj')
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

    test('setLogger', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.logger).toBeUndefined()
        expect(runner.setLogger('logger')).toBe(runner)
        expect(runner.logger).toBe('logger')
    })

    test.each([
        [{name: 'script name', version: 'my super   duper\tversion'}, '0d858590-script_name-my_super_duper_version'],
        [{version: 'my super   duper\tversion'}, '0d858590-my_super_duper_version'],
        [{name: 'script name'}, '0d858590-script_name'],
        [{}, '0d858590'],
    ])('gushioFolder', (cli, expected) => {
        const path = require('path')
        const generalPath = path.resolve('fake_folder')
        const runner = new Runner('appPath', 'scriptPath', 'run', cli, undefined, generalPath)

        expect(runner.gushioFolder)
            .toBe(path.resolve(generalPath, expected))
    })

    describe('installDependency', () => {
        let runner

        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath', 'run')
            runner.logger = {info: jest.fn()}
            runner.options = {verboseLogging: true}
        })

        test('already installed', async () => {
            await runner.installDependency('somePath', 'dep')
            expect(runner.logger.info).toHaveBeenNthCalledWith(1, 'Installing dependency dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).not.toHaveBeenCalled()
            expect(runner.logger.info).toHaveBeenNthCalledWith(2, 'Dependency dep already installed')
        })

        test('missing dependency', async () => {
            dependenciesUtils.checkDependencyInstalled.mockRejectedValueOnce(new Error('kaboom'))

            await runner.installDependency('somePath', 'dep')
            expect(runner.logger.info).toHaveBeenNthCalledWith(1, 'Installing dependency dep')
            expect(dependenciesUtils.checkDependencyInstalled).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(dependenciesUtils.installDependency).toHaveBeenCalledWith('somePath', 'dep', false)
            expect(runner.logger.info).toHaveBeenNthCalledWith(2, 'Dependency dep successfully installed')
        })
    })

    describe('getCommandPreActionHook', () => {
        let runner
        beforeEach(() => {
            runner = new Runner('appPath', 'scriptPath', 'run')
            runner.logger = {info: jest.fn()}
            runner.options = {cleanRun: true}
            runner.installDependency = jest.fn()
        })

        test('no dependencies', async () => {
            const hook = runner.getCommandPreActionHook([])
            await hook()

            expect(runner.logger.info).not.toHaveBeenCalled()
            expect(dependenciesUtils.ensureNodeModulesExists).not.toHaveBeenCalled()
        })

        test('with dependencies', async () => {
            runner._gushioFolder = 'gushioFolder'
            const hook = runner.getCommandPreActionHook(['dep1', 'dep2'])
            await hook()

            expect(runner.logger.info).toHaveBeenNthCalledWith(1, 'Checking dependencies')
            expect(dependenciesUtils.ensureNodeModulesExists).toHaveBeenCalledWith('gushioFolder', runner.options.cleanRun)
            expect(runner.installDependency).toHaveBeenNthCalledWith(1, 'gushioFolder', 'dep1')
            expect(runner.installDependency).toHaveBeenNthCalledWith(2, 'gushioFolder', 'dep2')
        })
    })

    test.each([
        true, false
    ])('getCommandAction', async (logging) => {
        const func = jest.fn()
        const runner = new Runner('appPath', 'scriptPath', func)
        runner.options = {verboseLogging: logging}
        runner.logger = {info: jest.fn()}
        runner._gushioFolder = 'someFolder'
        dependenciesUtils.buildPatchedRequire.mockImplementationOnce((path, allowedDeps) => {
            expect(path).toBe('someFolder')
            expect(allowedDeps).toStrictEqual(['shelljs', 'ansi-colors', 'enquirer', 'dep1', 'dep2'])
            return 'patched'
        })
        dependenciesUtils.runWithPatchedRequire.mockImplementationOnce((patchedRequire, func) => {
            expect(patchedRequire).toBe('patched')
            func()
        })

        const action = runner.getCommandAction( ['dep1', 'dep2'])
        await action('arg1', 'arg2', 'arg3', 'cliOptions', 'command')

        if (logging) {
            expect(runner.logger.info)
                .toHaveBeenNthCalledWith(1, 'Running with arguments ["arg1","arg2","arg3"]')
            expect(runner.logger.info)
                .toHaveBeenNthCalledWith(2, 'Running with options "cliOptions"')
            expect(runner.logger.info)
                .toHaveBeenNthCalledWith(3, 'Running with dependencies ["shelljs","ansi-colors","enquirer","dep1","dep2"] in someFolder')
        } else {
            expect(runner.logger.info).not.toHaveBeenCalled()
        }

        expect(func).toHaveBeenCalledWith(['arg1', 'arg2', 'arg3'], 'cliOptions')
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
            RunningError.mockImplementationOnce((script, message) => {
                expect(script).toBe('scriptPath')
                expect(message).toBe('kaboom!!!')
                return new Error('boom')
            })
            await expect(async () => await runner.run(['arg1', 'arg2'])).rejects.toThrow(new Error('boom'))
        })

        test('success', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            const command = {parseAsync: jest.fn().mockResolvedValueOnce(undefined)}
            runner.makeCommand = (path) => command
            await runner.run(['arg1', 'arg2'])
            expect(command.parseAsync).toHaveBeenCalledWith(['appPath', 'scriptPath', 'arg1', 'arg2'])
        })
    })
})