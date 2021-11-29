describe('Runner', () => {
    let Runner, LoadingError, RunningError

    beforeEach(() => {
        jest.resetModules()

        Runner = require('../Runner').Runner
        LoadingError = require('../errors').LoadingError
        RunningError = require('../errors').RunningError
    })

    describe('load', () => {

        test('invalid package', () => {
            const scriptPath = './invalid_script_path'
            expect(() => Runner.load(scriptPath)).toThrow(new LoadingError(scriptPath, 'file not found'))
        })

        test('valid package', () => {
            jest.mock('valid_script_path', () => ({someKey: 'someValue'}), { virtual: true })
            const dummy = require('valid_script_path')
            expect(Runner.load('valid_script_path')).toStrictEqual(dummy)
        })
    })

    describe('checkRunFunction', () => {
        const scriptPath = 'path'

        test('no value', () => {
            expect(() => Runner.checkRunFunction(scriptPath, undefined))
                .toThrow(new LoadingError(scriptPath, 'run function is not exported'))
        })

        test('not a function', () => {
            expect(() => Runner.checkRunFunction(scriptPath, 'not a function'))
                .toThrow(new LoadingError(scriptPath, 'run is not a function'))
        })

        test('function', () => {
            expect(() => Runner.checkRunFunction(scriptPath, () => {}))
                .not.toThrow()
        })
    })

    describe('checkCliObject', () => {
        const scriptPath = 'path'

        test('no value', () => {
            expect(() => Runner.checkCliObject(scriptPath, undefined))
                .not.toThrow()
        })

        test('empty object', () => {
            expect(() => Runner.checkCliObject(scriptPath, {}))
                .not.toThrow()
        })

        describe('arguments', () => {
            test('not array', () => {
                expect(() => Runner.checkCliObject(scriptPath, {arguments: 10}))
                    .toThrow(new LoadingError(scriptPath, 'cli.arguments is not an Array'))
            })

            test('missing name field', () => {
                expect(() => Runner.checkCliObject(scriptPath, {arguments: [
                        {name: 'foo'},
                        {invalid: 'name key is missing'},
                        {name: 'bar', otherKey: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'arguments must have a "name" field'))
            })

            test('valid', () => {
                expect(() => Runner.checkCliObject(scriptPath, {arguments: [
                        {name: 'foo'},
                        {name: 'bar', otherKey: 'other value'}
                    ]}))
                    .not.toThrow()
            })
        })

        describe('options', () => {
            test('not array', () => {
                expect(() => Runner.checkCliObject(scriptPath, {options: 10}))
                    .toThrow(new LoadingError(scriptPath, 'cli.options is not an Array'))
            })

            test('missing flags field', () => {
                expect(() => Runner.checkCliObject(scriptPath, {options: [
                        {flags: 'foo'},
                        {invalid: 'flags key is missing'},
                        {flags: 'bar', otherKey: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'options must have a "flags" field'))
            })

            test('valid', () => {
                expect(() => Runner.checkCliObject(scriptPath, {options: [
                        {flags: 'foo'},
                        {flags: 'bar', otherKey: 'other value'}
                    ]}))
                    .not.toThrow()
            })
        })
    })

    describe('checkDependencies', () => {
        const scriptPath = 'path'

        test('no value', () => {
            expect(() => Runner.checkDependencies(scriptPath, undefined))
                .not.toThrow()
        })

        test('not array', () => {
            expect(() => Runner.checkDependencies(scriptPath, 'not an array'))
                .toThrow(new LoadingError(scriptPath, 'deps is not an Array'))
        })

        test('dependency name missing', () => {
            expect(() => Runner.checkDependencies(scriptPath, [
                {name: 'dep1'},
                {notNameKey: 'otherValue'},
                {name: 'dep2'},
            ])).toThrow(new LoadingError(scriptPath, 'dependencies must have a "name" field'))
        })

        test('dependency duplicate without alias', () => {
            expect(() => Runner.checkDependencies(scriptPath, [
                {name: 'dep1'},
                {name: 'dep2'},
                {name: 'dep1'},
            ])).toThrow(new LoadingError(scriptPath, 'dependency "dep1" has been imported multiple times without different aliases'))
        })

        test('valid', () => {
            expect(() => Runner.checkDependencies(scriptPath, [
                {name: 'dep1'},
                {name: 'dep2'},
                {name: 'dep1', alias: 'dep1-variant1'},
                {name: 'dep3'},
                {name: 'dep1', alias: 'dep1-variant2'},
                {name: 'dep2', alias: 'other'},
            ])).not.toThrow()
        })
    })

    test('fromPath', () => {
        Runner.load = scriptPath => {
            expect(scriptPath).toBe('somePath')
            return 'script'
        }
        Runner.fromJsonObject = (application, scriptPath, scriptObject) => {
            expect(application).toBe('appPath')
            expect(scriptPath).toBe('somePath')
            expect(scriptObject).toBe('script')
            return 'runnerObj'
        }
        expect(Runner.fromPath('appPath', 'somePath')).toBe('runnerObj')
    })

    test('fromJsonObject', () => {
        Runner.checkRunFunction = jest.fn()
        Runner.checkCliObject = jest.fn()
        Runner.checkDependencies = jest.fn()
        const scriptPath = 'somePath'
        const scriptObject = {
            cli: {
                arguments: ['arg1', 'arg2'],
                options: ['opt1', 'opt2'],
            },
            run: 'run',
            deps: ['dep1', 'dep2']
        }
        expect(Runner.fromJsonObject('appPath', scriptPath, scriptObject))
            .toStrictEqual(new Runner('appPath', scriptPath, scriptObject.run, scriptObject.cli, scriptObject.deps))
        expect(Runner.checkRunFunction).toHaveBeenCalledWith(scriptPath, scriptObject.run)
        expect(Runner.checkCliObject).toHaveBeenCalledWith(scriptPath, scriptObject.cli)
        expect(Runner.checkDependencies).toHaveBeenCalledWith(scriptPath, scriptObject.deps)
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

    test('runnableFunction', () => {
        throw 'TODO'
    })

    test('makeCommand', () => {
        throw 'TODO'
    })

    describe('run', () => {
        test('failure', async () => {
            const runner = new Runner('appPath', 'scriptPath', 'run')
            runner.makeCommand = () => ({
                parseAsync: jest.fn().mockRejectedValueOnce('kaboom!!!')
            })
            await expect(async () => await runner.run(['arg1', 'arg2'])).rejects.toThrow(new RunningError('scriptPath', 'kaboom!!!'))
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