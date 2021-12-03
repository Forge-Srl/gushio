const {Command} = require('commander')
const {LoadingError, RunningError} = require('./errors')
const {
    requireScriptDependency, dependencyDescriptor, ensureNodeModulesExists, checkDependencyInstalled, installDependency
} = require('../utils/dependenciesUtils')
const {ScriptChecker} = require('./ScriptChecker')

const gushioFolder = '.gushio'

class Runner {

    static fromPath(application, scriptPath) {
        let scriptObject
        try {
            scriptObject = require(scriptPath)
        } catch (e) {
            throw new LoadingError(scriptPath, 'file not found')
        }
        return this.fromJsonObject(application, scriptPath, scriptObject)
    }

    static fromJsonObject(application, scriptPath, scriptObject) {
        const checker = new ScriptChecker(scriptPath)
        checker.checkScriptObject(scriptObject)

        return new Runner(application, scriptPath, scriptObject.run, scriptObject.cli, scriptObject.deps)
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

    getDependenciesVersionsAndNames() {
        const dependencies = this.dependencies
            .map(rawDep => dependencyDescriptor(rawDep.name, rawDep.version, rawDep.alias))

        return {
            versions: dependencies.map(d => d.npmInstallVersion),
            names: dependencies.map(d => d.name)
        }
    }

    setOptions(options) {
        this.options = options
        return this
    }

    setLogger(logger) {
        this.logger = logger
        return this
    }

    async installDependency(npmInstallVersion) {
        this.logger.info(`Installing dependency ${npmInstallVersion}`)
        try {
            await checkDependencyInstalled(gushioFolder, npmInstallVersion, !this.options.verboseLogging)
            this.logger.info(`Dependency ${npmInstallVersion} already installed`)
        } catch (e) {
            await installDependency(gushioFolder, npmInstallVersion, !this.options.verboseLogging)
            this.logger.info(`Dependency ${npmInstallVersion} successfully installed`)
        }
    }

    getCommandPreActionHook(dependenciesVersions) {
        return async (_thisCommand, _actionCommand) => {
            if (dependenciesVersions.length === 0) {
                return
            }

            this.logger.info('Checking dependencies')
            await ensureNodeModulesExists(gushioFolder)

            for (const dependency of dependenciesVersions) {
                await this.installDependency(dependency)
            }
        }
    }

    getCommandAction(dependenciesNames) {
        const dependencies = ['shelljs', 'ansi-colors', 'enquirer', ...dependenciesNames]

        return async (...args) => {
            const _command = args.pop()
            const cliOptions = args.pop()

            if (this.options.verboseLogging) {
                this.logger.info(`Running with arguments ${JSON.stringify(args)}`)
                this.logger.info(`Running with options ${JSON.stringify(cliOptions)}`)
                this.logger.info(`Running with dependencies ${JSON.stringify(dependencies)}`)
            }

            const injectedDependencies = Object.assign({}, ...dependencies
                .map(dependency => ({[dependency]: requireScriptDependency(dependency, `./${gushioFolder}`)})))

            await this.func(injectedDependencies, args, cliOptions)
        }
    }

    makeCommand() {
        const command = new Command()
            .name(this.cli.name || this.scriptPath)
            .description(this.cli.description || '')
            .version(this.cli.version || '')

        for (const argument of this.cli.arguments) {
            // TODO: use Argument constructor for more configurations
            //       see: https://github.com/tj/commander.js#more-configuration-1
            command.argument(argument.name, argument.description, argument.default)
        }

        for (const option of this.cli.options) {
            // TODO: use Option constructor for more configurations
            //       see: https://github.com/tj/commander.js#more-configuration
            command.option(option.flags, option.description, option.default)
        }

        // TODO: add command.addHelpText support in cli?
        //       see: https://github.com/tj/commander.js#custom-help

        const dependencies = this.getDependenciesVersionsAndNames()
        return command
            .hook('preAction', this.getCommandPreActionHook(dependencies.versions))
            .action(this.getCommandAction(dependencies.names))
    }

    async run(args) {
        const command = this.makeCommand()
        try {
            await command.parseAsync([this.application, this.scriptPath, ...args])
        } catch (e) {
            throw new RunningError(this.scriptPath, e.message)
        }
    }
}

module.exports = {Runner}