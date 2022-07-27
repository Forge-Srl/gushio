import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {
    ArgumentChoicesNotArrayError,
    ArgumentParserNotAFunctionError,
    CliArgumentsNotArrayError,
    CliOptionsNotArrayError,
    DependenciesNotArrayError,
    DuplicateDependencyError,
    MissingArgumentNameError,
    MissingDependencyNameError,
    MissingOptionFlagsError,
    OptionChoicesNotArrayError,
    OptionParserNotAFunctionError,
    RunFunctionNotExportedError,
    RunIsNotAFunctionError,
} from '../../runner/errors.js'
import crypto from 'crypto'

describe('ScriptHandler', () => {
    const scriptPath = 'path'
    let mockedPath, dependenciesUtils, Command, Argument, Option, InputValueDelayedParser, ScriptHandler, errors,
        handler

    beforeEach(async () => {
        mockedPath = jest.fn()
        jest.unstable_mockModule('path', () => ({default: mockedPath}))
        dependenciesUtils = {
            dependencyDescriptor: jest.fn(),
        }
        jest.unstable_mockModule('../../utils/dependenciesUtils.js', () => dependenciesUtils)

        Command = jest.fn()
        Argument = jest.fn()
        Option = jest.fn()
        jest.unstable_mockModule('commander', () => ({Command, Argument, Option}))

        InputValueDelayedParser = (await import('../../runner/InputValueDelayedParser.js')).InputValueDelayedParser
        ScriptHandler = (await import('../../runner/ScriptHandler.js')).ScriptHandler
        errors = await import('../../runner/errors')
        handler = new ScriptHandler(scriptPath, null)
    })

    test('getOnCommanderPreAction', async () => {
        const preAction = jest.fn()
        const callback = ScriptHandler.getOnCommanderPreAction('versions', 'folder', preAction)

        await callback()
        expect(preAction).toHaveBeenCalledWith('versions', 'folder')
    })

    test('getOnCommanderAction', async () => {
        const action = jest.fn()
        InputValueDelayedParser.prepareArguments = jest.fn().mockReturnValueOnce({
            rawArguments: 'raw',
            getArguments: 'get',
        })
        InputValueDelayedParser.prepareOptions = jest.fn().mockReturnValueOnce({rawOptions: 'raw', getOptions: 'get'})
        const callback = ScriptHandler.getOnCommanderAction('names', 'folder', 'runFunction', action)

        await callback('arg1', 'arg2', 'cliOptions', 'command')
        expect(action).toHaveBeenCalledWith({
            dependencies: 'names',
            gushioFolder: 'folder',
            rawArguments: 'raw',
            getArguments: 'get',
            rawOptions: 'raw',
            getOptions: 'get',
            runFunction: 'runFunction',
        })
        expect(InputValueDelayedParser.prepareArguments).toHaveBeenCalledWith(['arg1', 'arg2'])
        expect(InputValueDelayedParser.prepareOptions).toHaveBeenCalledWith('cliOptions')
    })

    test('getDependenciesVersionsAndNames', () => {
        dependenciesUtils.dependencyDescriptor
            .mockImplementation((name, version, alias) => ({name, npmInstallVersion: version + alias}))

        handler.normalizeDependencies = () => [
            {name: 'name1', version: 'version1', alias: 'alias1'},
            {name: 'name2', version: 'version2', alias: 'alias2'},
            {name: 'name3', version: 'version3', alias: 'alias3'},
        ]

        expect(handler.getDependenciesVersionsAndNames()).toStrictEqual({
            names: ['name1', 'name2', 'name3'],
            versions: ['version1alias1', 'version2alias2', 'version3alias3'],
        })
    })

    test.each([
        [{name: 'script name', version: 'my super   duper\tversion'}, '-script_name-my_super_duper_version'],
        [{version: 'my super   duper\tversion'}, '-my_super_duper_version'],
        [{name: 'script name'}, '-script_name'],
        [{}, ''],
    ])('getScriptFolder %p', async (cli, expected) => {
        const prefix = crypto.createHash('md5').update(scriptPath).digest('hex').substring(0, 8)
        mockedPath.resolve = jest.fn().mockImplementationOnce(() => 'resolved_folder')

        expect(handler.getScriptFolder('general', cli.name, cli.version)).toBe('resolved_folder')
        expect(mockedPath.resolve).toHaveBeenCalledWith('general', prefix + expected)
    })

    test.each([
        ['appName', 'appDesc', 'version', 'Custom after help'],
        [undefined, undefined, undefined, undefined],
    ])('toCommand %s %s %s', (appName, appDescription, appVersion, appHelp) => {
        handler.normalizeRunFunction = () => 'runFunction'
        handler.normalizeCliObject = () => ({
            name: appName,
            description: appDescription,
            version: appVersion,
            afterHelp: appHelp,
            arguments: ['arg1', 'arg2'],
            options: ['opt1', 'opt2'],
        })
        handler.getDependenciesVersionsAndNames = () => ({versions: 'versions', names: 'names'})
        handler.getScriptFolder = (gushioGeneralPath, name, version) => {
            expect(gushioGeneralPath).toBe('somePath')
            expect(name).toBe(appName)
            expect(version).toBe(appVersion)
            return 'scriptFolder'
        }
        ScriptHandler.getOnCommanderPreAction = (versions, scriptFolder, preAction) => {
            expect(versions).toBe('versions')
            expect(scriptFolder).toBe('scriptFolder')
            expect(preAction).toBe('preActionFn')
            return 'hook'
        }
        ScriptHandler.getOnCommanderAction = (names, scriptFolder, runFunction, action) => {
            expect(names).toBe('names')
            expect(scriptFolder).toBe('scriptFolder')
            expect(runFunction).toBe('runFunction')
            expect(action).toBe('actionFn')
            return 'action'
        }

        const command = {
            name: name => {
                expect(name).toBe(appName || scriptPath)
                return command
            },
            description: description => {
                expect(description).toBe(appDescription || '')
                return command
            },
            version: version => {
                expect(version).toBe(appVersion || '')
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
            },
        }

        Command.mockImplementationOnce(() => command)

        expect(handler.toCommand('somePath', 'preActionFn', 'actionFn')).toBe(command)
        expect(command.showSuggestionAfterError).toHaveBeenCalled()
        if (appHelp) {
            expect(command.addHelpText).toHaveBeenCalledWith('after', `\n${appHelp}`)
        } else {
            expect(command.addHelpText).not.toHaveBeenCalled()
        }
        expect(command.addArgument).toHaveBeenNthCalledWith(1, 'arg1')
        expect(command.addArgument).toHaveBeenNthCalledWith(2, 'arg2')
        expect(command.addOption).toHaveBeenNthCalledWith(1, 'opt1')
        expect(command.addOption).toHaveBeenNthCalledWith(2, 'opt2')
    })

    describe('normalizeRunFunction', () => {
        test('no value', () => {
            handler.scriptObject = {
                run: undefined,
            }
            expect(() => handler.normalizeRunFunction())
                .toThrow(new RunFunctionNotExportedError(scriptPath))
        })

        test('not a function', () => {
            handler.scriptObject = {
                run: 'not a function',
            }
            expect(() => handler.normalizeRunFunction())
                .toThrow(new RunIsNotAFunctionError(scriptPath))
        })

        test('function', () => {
            handler.scriptObject = {
                run: () => {
                },
            }
            expect(() => handler.normalizeRunFunction())
                .not.toThrow()
        })
    })

    describe('normalizeCliObject', () => {
        class ArgMock {
            constructor(name, description) {
                this.name = name
                this.description = description
            }

            choices(c) {
                this.choices = c
            }

            argParser(c) {
                this.argParser = c
            }

            default(c) {
                this.default = c
            }
        }

        class OptMock {
            constructor(flags, description) {
                this.flags = flags
                this.description = description
            }

            choices(c) {
                this.choices = c
            }

            argParser(c) {
                this.argParser = c
            }

            default(c) {
                this.default = c
            }

            env(c) {
                this.env = c
            }
        }

        beforeEach(() => {
            Argument.mockImplementation((name, description) => new ArgMock(name, description))
            Option.mockImplementation((flags, description) => new OptMock(flags, description))
            InputValueDelayedParser.commanderParserCallback = jest.fn().mockReturnValue('delayedParser')
        })

        test('no value', () => {
            handler.scriptObject = {}
            expect(handler.normalizeCliObject()).toStrictEqual({
                arguments: [],
                options: [],
            })
        })

        test('empty object', () => {
            handler.scriptObject = {cli: {}}
            expect(handler.normalizeCliObject()).toStrictEqual({
                arguments: [],
                options: [],
                afterHelp: undefined,
                description: undefined,
                name: undefined,
                version: undefined,
            })
        })

        test('object with data', () => {
            handler.scriptObject = {
                cli: {
                    afterHelp: 'help',
                    description: 'desc',
                    name: 'foo',
                    version: '4.2.0',
                },
            }
            expect(handler.normalizeCliObject()).toStrictEqual({
                arguments: [],
                options: [],
                afterHelp: 'help',
                description: 'desc',
                name: 'foo',
                version: '4.2.0',
            })
        })

        describe('arguments', () => {
            test('not array', () => {
                handler.scriptObject = {
                    cli: {
                        arguments: 10,
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new CliArgumentsNotArrayError(scriptPath))
            })

            test('missing name field', () => {
                handler.scriptObject = {
                    cli: {
                        arguments: [
                            {name: 'foo'},
                            {invalid: 'name key is missing'},
                            {name: 'bar', otherKey: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new MissingArgumentNameError(scriptPath))
            })

            test('choices not an Array', () => {
                handler.scriptObject = {
                    cli: {
                        arguments: [
                            {name: 'foo'},
                            {name: 'bar', choices: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new ArgumentChoicesNotArrayError(scriptPath, 'bar'))
            })

            test('parser not a function', () => {
                handler.scriptObject = {
                    cli: {
                        arguments: [
                            {name: 'foo'},
                            {name: 'bar', parser: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new ArgumentParserNotAFunctionError(scriptPath, 'bar'))
            })

            test('valid', () => {
                const fn = () => {
                }
                handler.scriptObject = {
                    cli: {
                        arguments: [
                            {name: 'foo', default: 3},
                            {name: 'bar', otherKey: 'other value', description: 'quix', parser: fn},
                            {name: 'baz', choices: ['asd', 'pbf']},
                        ],
                    },
                }
                expect(handler.normalizeCliObject()).toStrictEqual({
                    arguments: [
                        Object.assign(new ArgMock('foo'), {default: 3}),
                        Object.assign(new ArgMock('bar', 'quix'), {argParser: 'delayedParser'}),
                        Object.assign(new ArgMock('baz'), {choices: ['asd', 'pbf']}),
                    ],
                    options: [],
                    afterHelp: undefined,
                    description: undefined,
                    name: undefined,
                    version: undefined,
                })
                expect(InputValueDelayedParser.commanderParserCallback).toHaveBeenCalledWith(fn)
            })
        })

        describe('options', () => {
            test('not array', () => {
                handler.scriptObject = {
                    cli: {
                        options: 10,
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new CliOptionsNotArrayError(scriptPath))
            })

            test('missing flags field', () => {
                handler.scriptObject = {
                    cli: {
                        options: [
                            {flags: 'foo'},
                            {invalid: 'flags key is missing'},
                            {flags: 'bar', otherKey: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new MissingOptionFlagsError(scriptPath))
            })

            test('choices not an Array', () => {
                handler.scriptObject = {
                    cli: {
                        options: [
                            {flags: 'foo'},
                            {flags: 'bar', choices: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new OptionChoicesNotArrayError(scriptPath, 'bar'))
            })

            test('parser not a function', () => {
                handler.scriptObject = {
                    cli: {
                        options: [
                            {flags: 'foo'},
                            {flags: 'bar', parser: 'other value'},
                        ],
                    },
                }
                expect(() => handler.normalizeCliObject()).toThrow(new OptionParserNotAFunctionError(scriptPath, 'bar'))
            })

            test('valid', () => {
                const fn = () => {
                }
                handler.scriptObject = {
                    cli: {
                        options: [
                            {flags: 'foo', default: 3, env: 'BBBBB'},
                            {flags: 'bar', otherKey: 'other value', description: 'quix', parser: fn},
                            {flags: 'baz', choices: ['asd', 'qwerty']},
                        ],
                    },
                }
                expect(handler.normalizeCliObject()).toStrictEqual({
                    arguments: [],
                    options: [
                        Object.assign(new OptMock('foo'), {default: 3, env: 'BBBBB'}),
                        Object.assign(new OptMock('bar', 'quix'), {argParser: 'delayedParser'}),
                        Object.assign(new OptMock('baz'), {choices: ['asd', 'qwerty']}),
                    ],
                    afterHelp: undefined,
                    description: undefined,
                    name: undefined,
                    version: undefined,
                })
                expect(InputValueDelayedParser.commanderParserCallback).toHaveBeenCalledWith(fn)
            })
        })
    })

    describe('normalizeDependencies', () => {
        test('no value', () => {
            handler.scriptObject = {}
            expect(handler.normalizeDependencies()).toStrictEqual([])
        })

        test('not array', () => {
            handler.scriptObject = {
                deps: 'not an array',
            }
            expect(() => handler.normalizeDependencies()).toThrow(new DependenciesNotArrayError(scriptPath))
        })

        test('dependency name missing', () => {
            handler.scriptObject = {
                deps: [
                    {name: 'dep1'},
                    {notNameKey: 'otherValue'},
                    {name: 'dep2'},
                ],
            }
            expect(() => handler.normalizeDependencies()).toThrow(new MissingDependencyNameError(scriptPath))
        })

        test('dependency duplicate without alias', () => {
            handler.scriptObject = {
                deps: [
                    {name: 'dep1'},
                    {name: 'dep2'},
                    {name: 'dep1'},
                ],
            }
            expect(() => handler.normalizeDependencies()).toThrow(new DuplicateDependencyError(scriptPath, 'dep1'))
        })

        test('valid', () => {
            handler.scriptObject = {
                deps: [
                    {name: 'dep1'},
                    {name: 'dep2'},
                    {name: 'dep1', alias: 'dep1-variant1'},
                    {name: 'dep3'},
                    {name: 'dep1', alias: 'dep1-variant2'},
                    {name: 'dep2', alias: 'other'},
                ],
            }
            expect(handler.normalizeDependencies()).toStrictEqual([
                {name: 'dep1'},
                {name: 'dep2'},
                {name: 'dep1', alias: 'dep1-variant1'},
                {name: 'dep3'},
                {name: 'dep1', alias: 'dep1-variant2'},
                {name: 'dep2', alias: 'other'},
            ])
        })
    })
})