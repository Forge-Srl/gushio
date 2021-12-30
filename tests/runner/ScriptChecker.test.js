describe('ScriptChecker', () => {
    const scriptPath = 'path'
    let ScriptChecker, LoadingError, checker

    beforeEach(() => {
        ScriptChecker = require('../../runner/ScriptChecker').ScriptChecker
        LoadingError = require('../../runner/errors').LoadingError
        checker = new ScriptChecker(scriptPath)
    })

    test('checkScriptObject', () => {
        checker.checkRunFunction = jest.fn()
        checker.checkCliObject = jest.fn()
        checker.checkDependencies = jest.fn()

        checker.checkScriptObject({cli: 'cli', deps: 'deps', run: 'run'})

        expect(checker.checkRunFunction).toHaveBeenCalledWith('run')
        expect(checker.checkCliObject).toHaveBeenCalledWith('cli')
        expect(checker.checkDependencies).toHaveBeenCalledWith('deps')
    })

    describe('checkRunFunction', () => {
        test('no value', () => {
            expect(() => checker.checkRunFunction(undefined))
                .toThrow(new LoadingError(scriptPath, 'run function is not exported'))
        })

        test('not a function', () => {
            expect(() => checker.checkRunFunction('not a function'))
                .toThrow(new LoadingError(scriptPath, 'run is not a function'))
        })

        test('function', () => {
            expect(() => checker.checkRunFunction(() => {}))
                .not.toThrow()
        })
    })

    describe('checkCliObject', () => {
        test('no value', () => {
            expect(() => checker.checkCliObject(undefined))
                .not.toThrow()
        })

        test('empty object', () => {
            expect(() => checker.checkCliObject({}))
                .not.toThrow()
        })

        describe('arguments', () => {
            test('not array', () => {
                expect(() => checker.checkCliObject({arguments: 10}))
                    .toThrow(new LoadingError(scriptPath, 'cli.arguments is not an Array'))
            })

            test('missing name field', () => {
                expect(() => checker.checkCliObject({arguments: [
                        {name: 'foo'},
                        {invalid: 'name key is missing'},
                        {name: 'bar', otherKey: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'arguments must have a "name" field'))
            })

            test('choices not an Array', () => {
                expect(() => checker.checkCliObject({arguments: [
                        {name: 'foo'},
                        {name: 'bar', choices: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'argument choices must be an Array of strings'))
            })

            test('valid', () => {
                expect(() => checker.checkCliObject({arguments: [
                        {name: 'foo'},
                        {name: 'bar', otherKey: 'other value'},
                        {name: 'baz', choices: ['asd', 'pbf']}
                    ]}))
                    .not.toThrow()
            })
        })

        describe('options', () => {
            test('not array', () => {
                expect(() => checker.checkCliObject({options: 10}))
                    .toThrow(new LoadingError(scriptPath, 'cli.options is not an Array'))
            })

            test('missing flags field', () => {
                expect(() => checker.checkCliObject({options: [
                        {flags: 'foo'},
                        {invalid: 'flags key is missing'},
                        {flags: 'bar', otherKey: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'options must have a "flags" field'))
            })

            test('choices not an Array', () => {
                expect(() => checker.checkCliObject({options: [
                        {flags: 'foo'},
                        {flags: 'bar', choices: 'other value'},
                    ]}))
                    .toThrow(new LoadingError(scriptPath, 'option choices must be an Array of strings'))
            })

            test('valid', () => {
                expect(() => checker.checkCliObject({options: [
                        {flags: 'foo'},
                        {flags: 'bar', otherKey: 'other value'},
                        {flags: 'bar', choices: ['asd', 'qwerty']},
                    ]}))
                    .not.toThrow()
            })
        })
    })

    describe('checkDependencies', () => {
        test('no value', () => {
            expect(() => checker.checkDependencies(undefined))
                .not.toThrow()
        })

        test('not array', () => {
            expect(() => checker.checkDependencies('not an array'))
                .toThrow(new LoadingError(scriptPath, 'deps is not an Array'))
        })

        test('dependency name missing', () => {
            expect(() => checker.checkDependencies([
                {name: 'dep1'},
                {notNameKey: 'otherValue'},
                {name: 'dep2'},
            ])).toThrow(new LoadingError(scriptPath, 'dependencies must have a "name" field'))
        })

        test('dependency duplicate without alias', () => {
            expect(() => checker.checkDependencies([
                {name: 'dep1'},
                {name: 'dep2'},
                {name: 'dep1'},
            ])).toThrow(new LoadingError(scriptPath, 'dependency "dep1" has been imported multiple times without different aliases'))
        })

        test('valid', () => {
            expect(() => checker.checkDependencies([
                {name: 'dep1'},
                {name: 'dep2'},
                {name: 'dep1', alias: 'dep1-variant1'},
                {name: 'dep3'},
                {name: 'dep1', alias: 'dep1-variant2'},
                {name: 'dep2', alias: 'other'},
            ])).not.toThrow()
        })
    })
})