const {Command} = require('commander')
const {LoadingError, RunningError} = require('./errors')

class Runner {

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

    static checkDependencies(scriptPath, dependencies) {
        if (!dependencies) {
            return
        }

        if (!Array.isArray(dependencies)) {
            throw new LoadingError(scriptPath, 'deps is not an Array')
        }

        for (const dependency of dependencies) {
            if (!dependency.name) {
                throw new LoadingError(scriptPath, 'dependencies must have a "name" field')
            }
        }

        const duplicateCandidates = dependencies.map(d => d.name).filter((item, index) => dependencies.indexOf(item) !== index)
        for (const duplicate of duplicateCandidates) {
            const dependencyDuplicates = dependencies.filter(dep => dep.name === duplicate)

            if (dependencyDuplicates.length !== new Set(dependencyDuplicates.map(dep => dep.alias)).size) {
                throw new LoadingError(scriptPath, `dependency "${duplicate}" has been imported multiple times without different aliases`)
            }
        }
    }

    static fromPath(application, scriptPath) {
        return this.fromJsonObject(application, scriptPath, this.load(scriptPath))
    }

    static fromJsonObject(application, scriptPath, scriptObject) {
        const runFunction = scriptObject.run
        const cli = scriptObject.cli
        const dependencies = scriptObject.deps

        this.checkRunFunction(scriptPath, runFunction)
        this.checkCliObject(scriptPath, cli)
        this.checkDependencies(scriptPath, dependencies)

        return new Runner(application, scriptPath, runFunction, cli, dependencies)
    }

    constructor(application, scriptPath, func, cli, dependencies) {
        this.application = application
        this.scriptPath = scriptPath
        this.func = func
        this.cli = cli || {}
        this.cli.arguments = this.cli.arguments || []
        this.cli.options = this.cli.options || []
        this.dependencies = dependencies || []
    }

    get runnableFunction() {
        const dependencies = ['shelljs', 'ansi-colors', 'enquirer']
        const injectedDependencies = Object.assign({}, ...dependencies
            .map(dependency => ({[dependency]: require(dependency)})))
        return this.func(injectedDependencies)
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

        return command.action(async (...args) => {
            const command = args.pop()
            const cliOptions = args.pop()
            await this.runnableFunction(args, cliOptions)
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