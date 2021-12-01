describe('cliProgram', () => {
    let program, Program, path, Command, Runner, packageInfo

    beforeEach(() => {
        jest.resetModules()

        jest.mock('path')
        path = require('path')
        jest.mock('commander')
        Command = require('commander').Command
        jest.mock('../Runner')
        Runner = require('../Runner').Runner

        packageInfo = require('../package.json')

        Program = require('../cliProgram').Program
        program = new Program('myLogger')
    })

    test('getCommand', () => {
        const commandObj = {}
        Command.mockImplementationOnce(() => commandObj)
        commandObj.name = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.description = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.version = jest.fn().mockImplementationOnce(() => commandObj)
        commandObj.option = jest.fn().mockImplementation(() => commandObj)
        commandObj.action = jest.fn().mockImplementationOnce(() => commandObj)

        program.commandAction = workingDir => {
            expect(workingDir).toBe('workingDir')
            return 'action'
        }

        expect(program.getCommand('workingDir')).toBe(commandObj)
        expect(commandObj.name).toHaveBeenCalledWith(packageInfo.name)
        expect(commandObj.description).toHaveBeenCalledWith(packageInfo.description)
        expect(commandObj.option).toHaveBeenNthCalledWith(1, '-s, --script <path>', 'path to the script')
        expect(commandObj.option).toHaveBeenNthCalledWith(2, '-v, --verbose', 'enable verbose logging')
        expect(commandObj.action).toHaveBeenCalledWith('action')
    })

    describe('commandAction', () => {
        let action

        beforeEach(() => {
            action = program.commandAction('workingDir')
        })

        test('no script', async () => {
            await action({someKey: 'but it is not "script"'}, null)
            expect(Runner.fromPath).not.toHaveBeenCalled()
        })

        test('with script', async () => {
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
            await action({script: 'someScript', verbose: 'verbose'}, {
                rawArgs: ['nodeApp', 'gushioApp', 'otherArgs'],
                args: 'someArgs'
            })
            expect(path.resolve).toHaveBeenCalledWith('workingDir', 'someScript')
            expect(run).toHaveBeenCalledWith('someArgs')
        })
    })
})