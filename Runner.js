const {Command} = require('commander')
const {LoadingError, RunningError} = require('./errors')

class Runner {

    static runningError(path, message) {
        return new Error(`Error while running '${path}': ${message}`)
    }

    static load(scriptPath) {
        try {
            return require(scriptPath)
        } catch (e) {
            throw new LoadingError(scriptPath, 'file not found')
        }
    }

    static checkRunFunction(scriptPath, runFunction) {
        if (!runFunction) {
            throw new LoadingError(scriptPath, 'run function is not exported')
        }
        if (typeof runFunction !== 'function') {
            throw new LoadingError(scriptPath, 'run is not a function')
        }
    }

    static checkCliObject(scriptPath, cli) {
        if (!cli) {
            return
        }

        if (cli.arguments) {
            if (!Array.isArray(cli.arguments)) {
                throw new LoadingError(scriptPath, 'cli.arguments is not an Array')
            }

            for (const argument of cli.arguments) {
                if (!argument.name) {
                    throw new LoadingError(scriptPath, 'arguments must have a "name" field')
                }
            }
        }

        if (cli.options) {
            if (!Array.isArray(cli.options)) {
                throw new LoadingError(scriptPath, 'cli.options is not an Array')
            }

            for (const option of cli.options) {
                if (!option.flags) {
                    throw new LoadingError(scriptPath, 'options must have a "flags" field')
                }
            }
        }
    }

    static fromPath(application, scriptPath) {
        const script = this.load(scriptPath)
        const runFunction = script.run
        const cli = script.cli

        this.checkRunFunction(scriptPath, runFunction)
        this.checkCliObject(scriptPath, cli)

        return new Runner(application, scriptPath, cli, runFunction)
    }

    constructor(application, scriptPath, cli, func) {
        this.application = application
        this.scriptPath = scriptPath
        this.cli = cli || {}
        this.cli.arguments = this.cli.arguments || []
        this.cli.options = this.cli.options || []
        this.func = func
    }

    makeCommand() {
        const command = new Command()
            .name(this.cli.name || this.scriptPath)
            .description(this.cli.description || '')
            .version(this.cli.version || '')

        for (const argument of this.cli.arguments) {
            command.argument(argument.name, argument.description, argument.default)
        }

        for (const option of this.cli.options) {
            command.option(option.flags, option.description, option.default)
        }

        const shelljs = require('shelljs')
        const colors = require('ansi-colors')
        const enquirer = require('enquirer')
        const runnableFunction = this.func(shelljs, colors, enquirer)

        return command.action(async (...args) => {
            const command = args.pop()
            const cliOptions = args.pop()
            await runnableFunction(args, cliOptions)
        })
    }

    async run(args) {
        const command = this.makeCommand()
        try {
            await command.parseAsync([this.application, this.scriptPath, ...args])
        } catch (e) {
            throw new RunningError(this.scriptPath, e)
        }
    }
}

module.exports = {Runner}