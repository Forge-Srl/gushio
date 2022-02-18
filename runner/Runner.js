import path from 'path'
import crypto from 'crypto'
import {Argument, Command, Option} from 'commander'
import isString from 'is-string'
import {
    buildPatchedImport,
    checkDependencyInstalled,
    dependencyDescriptor,
    ensureNodeModulesExists,
    installDependency,
    requireStrategy,
} from '../utils/dependenciesUtils.js'
import {GushioLogFormat} from './GushioConsole.js'
import {ScriptChecker} from './ScriptChecker.js'
import {LoadingError, parseSyntaxError, RunningError} from './errors.js'
import {FunctionWrapper} from './patches/FunctionWrapper.js'
import {patchedConsoleWrapper} from './patches/patchedConsoleWrapper.js'
import {patchedStringWrapper} from './patches/patchedStringWrapper.js'
import {fetchWrapper} from './patches/fetchWrapper.js'
import {YAMLWrapper} from './patches/YAMLWrapper.js'
import {fileSystemWrapper} from './patches/fileSystemWrapper.js'
import {timerWrapper} from './patches/timerWrapper.js'
import {gushioWrapper} from './patches/gushioWrapper.js'

export class Runner {

    static isUrlHTTP(string) {
        return string.startsWith('http://') || string.startsWith('https://')
    }

    static async fromPath(application, scriptPath, workingDir, gushioGeneralPath) {
        if (this.isUrlHTTP(scriptPath)) {
            return await this.fromRequire(application, scriptPath, requireStrategy.remotePath, gushioGeneralPath)
        }
        return await this.fromRequire(application, path.resolve(workingDir, scriptPath), requireStrategy.localPath,
            gushioGeneralPath)
    }

    static async fromRequire(application, scriptPath, requireStrategy, gushioGeneralPath) {
        let scriptObject
        try {
            scriptObject = await requireStrategy(scriptPath)
        } catch (e) {
            if (e instanceof SyntaxError) {
                const parsed = parseSyntaxError(e)
                throw new LoadingError(scriptPath, `"${parsed.message}" at line ${parsed.line}\n${parsed.details}`)
            }
            throw new LoadingError(scriptPath, e.message)
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

            this._gushioFolder = path.resolve(this.gushioGeneralPath, folderName.replace(/\s+/g, '_'))
        }

        return this._gushioFolder
    }

    getDependenciesVersionsAndNames() {
        const dependencies = this.dependencies
            .map(rawDep => dependencyDescriptor(rawDep.name, rawDep.version, rawDep.alias))

        return {
            versions: dependencies.map(d => d.npmInstallVersion),
            names: dependencies.map(d => d.name),
        }
    }

    setOptions(options) {
        this.options = options
        return this
    }

    setConsole(console) {
        this.console = console
        return this
    }

    async similarRunnerFromPath(scriptPath, workingDir) {
        return (await Runner.fromPath(this.application, scriptPath, workingDir, this.gushioGeneralPath))
            .setConsole(this.console)
            .setOptions(this.options)
    }

    async installDependency(path, npmInstallVersion) {
        this.console.info(GushioLogFormat, `Installing dependency ${npmInstallVersion}`)
        try {
            await checkDependencyInstalled(path, npmInstallVersion, !this.console.isVerbose)
            this.console.info(GushioLogFormat, `Dependency ${npmInstallVersion} already installed`)
        } catch (e) {
            await installDependency(path, npmInstallVersion, !this.console.isVerbose)
            this.console.info(GushioLogFormat, `Dependency ${npmInstallVersion} successfully installed`)
        }
    }

    getCommandPreActionHook(dependenciesVersions) {
        return async (_thisCommand, _actionCommand) => {
            if (dependenciesVersions.length === 0) {
                return
            }

            this.console.info(GushioLogFormat, 'Checking dependencies')
            const gushioFolder = this.gushioFolder
            await ensureNodeModulesExists(gushioFolder, this.options.cleanRun)

            for (const dependency of dependenciesVersions) {
                await this.installDependency(gushioFolder, dependency)
            }
        }
    }

    buildCombinedFunctionWrapper(dependencies) {
        const patchedImport = buildPatchedImport(this.gushioFolder, dependencies, !this.console.isVerbose)
        const buildSimilarRunner = async (scriptPath, workingDir) =>
            await this.similarRunnerFromPath(scriptPath, workingDir)
        const scriptPath = Runner.isUrlHTTP(this.scriptPath) ? '' : this.scriptPath

        return FunctionWrapper.combine(
            patchedStringWrapper(),
            patchedConsoleWrapper(this.console),
            fetchWrapper(),
            YAMLWrapper(),
            fileSystemWrapper(scriptPath, this.console.isVerbose),
            timerWrapper(),
            gushioWrapper(buildSimilarRunner, patchedImport),
        )
    }

    getCommandAction(dependenciesNames) {
        const dependencies = ['shelljs', ...dependenciesNames]
        const combinedWrapper = this.buildCombinedFunctionWrapper(dependencies)

        return async (...args) => {
            const _command = args.pop()
            const cliOptions = args.pop()

            this.console.verbose(GushioLogFormat, `Running with arguments ${JSON.stringify(args)}`)
            this.console.verbose(GushioLogFormat, `Running with options ${JSON.stringify(cliOptions)}`)
            this.console.verbose(GushioLogFormat, `Running with dependencies ${JSON.stringify(dependencies)} in ${(this.gushioFolder)}`)

            await combinedWrapper.run(async () => {
                try {
                    await this.func(args, cliOptions)
                } catch (e) {
                    const message = isString(e) ? e : e.message
                    throw new RunningError(this.scriptPath, message)
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