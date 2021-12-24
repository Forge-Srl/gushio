const {Command, Argument, Option} = require('commander')
const path = require('path')
const crypto = require('crypto')
const {
    buildPatchedRequire,
    runWithPatchedRequire,
    dependencyDescriptor,
    ensureNodeModulesExists,
    checkDependencyInstalled,
    installDependency
} = require('../utils/dependenciesUtils')
const {LoadingError, RunningError, parseSyntaxError} = require('./errors')
const {ScriptChecker} = require('./ScriptChecker')

class Runner {

    static fromPath(application, scriptPath, gushioGeneralPath) {
        let scriptObject
        try {
            scriptObject = require(scriptPath)
        } catch (e) {
            if (e instanceof SyntaxError) {
                const parsed = parseSyntaxError(e)
                throw new LoadingError(scriptPath, `"${parsed.message}" at line ${parsed.line}\n${parsed.details}`)
            }
            throw new LoadingError(scriptPath, 'file not found')
        }
        return this.fromJsonObject(application, scriptPath, scriptObject, gushioGeneralPath)
    }

    static fromJsonObject(application, scriptPath, scriptObject, gushioGeneralPath) {
        const checker = new ScriptChecker(scriptPath)
        checker.checkScriptObject(scriptObject)

        return new Runner(application, scriptPath, scriptObject.run, scriptObject.cli, scriptObject.deps,
            gushioGeneralPath)
    }

    constructor(application, scriptPath, func, cli, dependencies, gushioGeneralPath) {
        this.application = application
        this.scriptPath = scriptPath
        this.func = func
        this.cli = cli || {}
        this.cli.arguments = this.cli.arguments || []
        this.cli.options = this.cli.options || []
        this.dependencies = dependencies || []
        this.gushioGeneralPath = gushioGeneralPath
    }

    get gushioFolder() {
        if (!this._gushioFolder) {
            let folderName = crypto.createHash('md5').update(this.scriptPath).digest('hex').substring(0, 8)
            if (this.cli.name) {
                folderName += `-${this.cli.name}`
            }
            if (this.cli.version) {
                folderName += `-${this.cli.version}`
            }

            this._gushioFolder = path.resolve(this.gushioGeneralPath, folderName.replaceAll(/\s+/g, '_'))
        }

        return this._gushioFolder
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

    async installDependency(path, npmInstallVersion) {
        this.logger.info(`Installing dependency ${npmInstallVersion}`)
        try {
            await checkDependencyInstalled(path, npmInstallVersion, !this.options.verboseLogging)
            this.logger.info(`Dependency ${npmInstallVersion} already installed`)
        } catch (e) {
            await installDependency(path, npmInstallVersion, !this.options.verboseLogging)
            this.logger.info(`Dependency ${npmInstallVersion} successfully installed`)
        }
    }

    getCommandPreActionHook(dependenciesVersions) {
        return async (_thisCommand, _actionCommand) => {
            if (dependenciesVersions.length === 0) {
                return
            }

            this.logger.info('Checking dependencies')
            const gushioFolder = this.gushioFolder
            await ensureNodeModulesExists(gushioFolder, this.options.cleanRun)

            for (const dependency of dependenciesVersions) {
                await this.installDependency(gushioFolder, dependency)
            }
        }
    }

    getCommandAction(dependenciesNames) {
        const dependencies = ['shelljs', 'ansi-colors', 'enquirer', ...dependenciesNames]
        const gushioFolder = this.gushioFolder
        const patchedRequire = buildPatchedRequire(gushioFolder, dependencies, !this.options.verboseLogging)
        const runPatched = runWithPatchedRequire(patchedRequire)

        return async (...args) => {
            const _command = args.pop()
            const cliOptions = args.pop()

            if (this.options.verboseLogging) {
                this.logger.info(`Running with arguments ${JSON.stringify(args)}`)
                this.logger.info(`Running with options ${JSON.stringify(cliOptions)}`)
                this.logger.info(`Running with dependencies ${JSON.stringify(dependencies)} in ${gushioFolder}`)
            }

            await runPatched(async () => {
                try {
                    await this.func(args, cliOptions)
                } catch (e) {
                    throw new RunningError(this.scriptPath, e.message)
                }
            })
        }
    }

    makeCommand() {
        const command = new Command()
            .name(this.cli.name || this.scriptPath)
            .description(this.cli.description || '')
            .version(this.cli.version || '')
            .showSuggestionAfterError()

        if (this.cli.afterHelp) {
            command.addHelpText('after', `\n${this.cli.afterHelp}`)
        }

        for (const argument of this.cli.arguments) {
            const argumentObj = new Argument(argument.name, argument.description)
            if (argument.default) {
                argumentObj.default(argument.default)
            }
            if (argument.choices) {
                argumentObj.choices(argument.choices)
            }
            // TODO(feature): add argumentObj.argParser?
            command.addArgument(argumentObj)
        }

        for (const option of this.cli.options) {
            const optionObj = new Option(option.flags, option.description)
            if (option.default) {
                optionObj.default(option.default)
            }
            if (option.env) {
                optionObj.env(option.env)
            }
            if (option.choices) {
                optionObj.choices(option.choices)
            }
            // TODO(feature): add optionObj.argParser?
            command.addOption(optionObj)
        }

        const dependencies = this.getDependenciesVersionsAndNames()
        return command
            .hook('preAction', this.getCommandPreActionHook(dependencies.versions))
            .action(this.getCommandAction(dependencies.names))
    }

    async run(args) {
        const command = this.makeCommand()
        await command.parseAsync([this.application, this.scriptPath, ...args])
    }
}

module.exports = {Runner}