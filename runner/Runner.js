import path from 'path'
import isString from 'is-string'
import {
    buildPatchedImport,
    ensureNodeModulesExists,
    installDependencies,
    requireStrategy,
} from '../utils/dependenciesUtils.js'
import {GushioDepsLogFormat, GushioScriptLogFormat} from './GushioConsole.js'
import {ScriptHandler} from './ScriptHandler.js'
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

    static async fromPath(application, scriptPath, workingDir, gushioGeneralPath, trace) {
        if (this.isUrlHTTP(scriptPath)) {
            return await this.fromRequire(application, scriptPath, requireStrategy.remotePath, gushioGeneralPath, trace)
        }
        return await this.fromRequire(application, path.resolve(workingDir, scriptPath), requireStrategy.localPath,
            gushioGeneralPath, trace)
    }

    static async fromRequire(application, scriptPath, requireStrategy, gushioGeneralPath, trace) {
        let scriptObject
        try {
            scriptObject = await requireStrategy(scriptPath, trace)
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
        const scriptHandler = new ScriptHandler(scriptPath, scriptObject)
        return new Runner(application, scriptPath, scriptHandler, gushioGeneralPath)
    }

    constructor(application, scriptPath, scriptHandler, gushioGeneralPath) {
        this.application = application
        this.scriptPath = scriptPath
        this.scriptHandler = scriptHandler
        this.gushioGeneralPath = gushioGeneralPath
    }

    setGushioOptions(options) {
        this.options = options
        return this
    }

    setGushioConsole(console) {
        this.console = console
        return this
    }

    async similarRunnerFromPath(scriptPath, workingDir) {
        return (await Runner
            .fromPath(this.application, scriptPath, workingDir, this.gushioGeneralPath, this.options.trace))
            .setGushioConsole(this.console)
            .setGushioOptions(this.options)
    }

    async onPreActionHook(dependenciesVersions, gushioFolder) {
        if (dependenciesVersions.length === 0) {
            return
        }

        this.console.info(GushioDepsLogFormat, `Checking dependencies in ${gushioFolder}`)
        await ensureNodeModulesExists(gushioFolder, this.options.cleanRun)
        await installDependencies(gushioFolder, dependenciesVersions, this.console)
    }

    buildCombinedFunctionWrapper(dependencies, gushioFolder) {
        const scriptPath = Runner.isUrlHTTP(this.scriptPath) ? '' : this.scriptPath
        const patchedImport = buildPatchedImport(
            path.dirname(scriptPath),
            gushioFolder,
            dependencies,
            !this.console.isVerbose,
        )
        const buildSimilarRunner = async (scriptPath, workingDir) =>
            await this.similarRunnerFromPath(scriptPath, workingDir)

        return FunctionWrapper.combine(
            patchedStringWrapper(),
            patchedConsoleWrapper(this.console),
            fetchWrapper(),
            YAMLWrapper(),
            fileSystemWrapper(scriptPath, this.console.isVerbose),
            timerWrapper(),
            gushioWrapper(buildSimilarRunner, patchedImport, this.console),
        )
    }

    async onCommandAction(settings) {
        const dependencies = ['shelljs', ...settings.dependencies]
        const combinedWrapper = this.buildCombinedFunctionWrapper(dependencies, settings.gushioFolder)

        this.console.verbose(GushioScriptLogFormat, `Running with dependencies ${JSON.stringify(dependencies)} in ${(settings.gushioFolder)}`)
        this.console.verbose(GushioScriptLogFormat, `Running with raw arguments ${JSON.stringify(settings.rawArguments)}`)
        this.console.verbose(GushioScriptLogFormat, `Running with raw options ${JSON.stringify(settings.rawOptions)}`)

        await combinedWrapper.run(async () => {
            try {
                const parsedArguments = await settings.getArguments()
                this.console.verbose(GushioScriptLogFormat, `Running with parsed arguments ${JSON.stringify(parsedArguments)}`)
                const parsedOptions = await settings.getOptions()
                this.console.verbose(GushioScriptLogFormat, `Running with parsed options ${JSON.stringify(parsedOptions)}`)

                await settings.runFunction(parsedArguments, parsedOptions)
            } catch (e) {
                const message = isString(e) ? e : e.message
                throw new RunningError(this.scriptPath, message)
            }
        })
    }

    async run(args) {
        const command = this.scriptHandler.toCommand(
            this.gushioGeneralPath,
            async (depsVersions, gushioFolder) => await this.onPreActionHook(depsVersions, gushioFolder),
            async (settings) => await this.onCommandAction(settings),
        )
        await command.parseAsync([this.application, this.scriptPath, ...args])
    }
}