describe('Runner', () => {
    let Runner, LoadingError, RunningError, ScriptChecker, dependenciesUtils, Command

    beforeEach(() => {
        jest.resetModules()

        jest.mock('../../runner/ScriptChecker')
        ScriptChecker = require('../../runner/ScriptChecker').ScriptChecker

        jest.mock('../../utils/dependenciesUtils')
        dependenciesUtils = require('../../utils/dependenciesUtils')

        jest.mock('commander')
        Command = require('commander').Command

        Runner = require('../../runner/Runner').Runner
        LoadingError = require('../../runner/errors').LoadingError
        RunningError = require('../../runner/errors').RunningError
    })

    describe('fromPath', () => {
        test('invalid package', () => {
            const scriptPath = './invalid_script_path'
            expect(() => Runner.fromPath('appPath', scriptPath)).toThrow(new LoadingError(scriptPath, 'file not found'))
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

    test('getGushioFolder', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run')
        expect(runner.getGushioFolder('somePath')).toBe('somePath/.gushio')
        runner.gushioFolderName = 'different-gushio-path'
        expect(runner.getGushioFolder('somePath')).toBe('somePath/different-gushio-path')
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
            runner.installDependency = jest.fn()
        })

        test('no dependencies', async () => {
            const hook = runner.getCommandPreActionHook('somePath', [])
            await hook()

            expect(runner.logger.info).not.toHaveBeenCalled()
            expect(dependenciesUtils.ensureNodeModulesExists).not.toHaveBeenCalled()
        })

        test('with dependencies', async () => {
            runner.getGushioFolder = path => {
                expect(path).toBe('somePath')
                return 'gushioFolder'
            }
            const hook = runner.getCommandPreActionHook('somePath', ['dep1', 'dep2'])
            await hook()

            expect(runner.logger.info).toHaveBeenNthCalledWith(1, 'Checking dependencies')
            expect(dependenciesUtils.ensureNodeModulesExists).toHaveBeenCalledWith('gushioFolder')
            expect(runner.installDependency).toHaveBeenNthCalledWith(1, 'gushioFolder', 'dep1')
            expect(runner.installDependency).toHaveBeenNthCalledWith(2, 'gushioFolder', 'dep2')
        })
    })

    test('getCommandAction', async () => {
        const func = jest.fn()
        const runner = new Runner('appPath', 'scriptPath', func)
        runner.options = {verboseLogging: true}
        runner.logger = {info: jest.fn()}
        runner.getGushioFolder = path => {
            expect(path).toBe('somePath')
            return 'someFolder'
        }
        dependenciesUtils.requireScriptDependency.mockImplementation((dependency, path) => {
            expect(path).toBe('someFolder')
            return 'resolved'
        })

        const action = runner.getCommandAction('somePath', ['dep1', 'dep2'])
        await action('arg1', 'arg2', 'arg3', 'cliOptions', 'command')

        expect(runner.logger.info)
            .toHaveBeenNthCalledWith(1, 'Running with arguments ["arg1","arg2","arg3"]')
        expect(runner.logger.info)
            .toHaveBeenNthCalledWith(2, 'Running with options "cliOptions"')
        expect(runner.logger.info)
            .toHaveBeenNthCalledWith(3, 'Running with dependencies ["shelljs","ansi-colors","enquirer","dep1","dep2"]')
        expect(func).toHaveBeenCalledWith({
            "shelljs": "resolved",
            "ansi-colors": "resolved",
            "enquirer": "resolved",
            "dep1": "resolved",
            "dep2": "resolved"
        }, ['arg1', 'arg2', 'arg3'], 'cliOptions')
    })

    test('makeCommand', () => {
        const runner = new Runner('appPath', 'scriptPath', 'run', {
            description: 'appDesc',
            version: 'version',
            arguments: [
                {name: 'name1', description: 'desc1', default: 'def1'},
                {name: 'name2', description: 'desc2', default: 'def2'},
            ],
            options: [
                {flags: 'flag1', description: 'desc_flag1', default: 'def_flag1'},
                {flags: 'flag2', description: 'desc_flag2', default: 'def_flag2'},
            ]
        })
        runner.getDependenciesVersionsAndNames = () => ({versions: 'versions', names: 'names'})
        runner.getCommandPreActionHook = (path, versions) => {
            expect(path).toBe('somePath')
            expect(versions).toBe('versions')
            return 'hook'
        }
        runner.getCommandAction = (path, names) => {
            expect(path).toBe('somePath')
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
            argument: jest.fn(),
            option: jest.fn(),
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
        Command.mockImplementationOnce(() => command)

        expect(runner.makeCommand('somePath')).toBe(command)
        expect(command.argument).toHaveBeenNthCalledWith(1, 'name1', 'desc1', 'def1')
        expect(command.argument).toHaveBeenNthCalledWith(2, 'name2', 'desc2', 'def2')
        expect(command.option).toHaveBeenNthCalledWith(1, 'flag1', 'desc_flag1', 'def_flag1')
        expect(command.option).toHaveBeenNthCalledWith(2, 'flag2', 'desc_flag2', 'def_flag2')
    })

    describe('run', () => {
        test('failure', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            runner.makeCommand = (path) => {
                expect(path).toBe('somePath')
                return {
                    parseAsync: jest.fn().mockRejectedValueOnce(new Error('kaboom!!!'))
                }
            }
            await expect(async () => await runner.run('somePath', ['arg1', 'arg2'])).rejects
                .toThrow(new RunningError('scriptPath', 'kaboom!!!'))
        })

        test('success', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            const command = {parseAsync: jest.fn().mockResolvedValueOnce(undefined)}
            runner.makeCommand = (path) => {
                expect(path).toBe('somePath')
                return command
            }
            await runner.run('somePath', ['arg1', 'arg2'])
            expect(command.parseAsync).toHaveBeenCalledWith(['appPath', 'scriptPath', 'arg1', 'arg2'])
        })
    })
})