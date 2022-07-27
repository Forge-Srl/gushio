import {
    RunFunctionNotExportedError,
    RunIsNotAFunctionError,
    CliArgumentsNotArrayError,
    MissingArgumentNameError,
    ArgumentChoicesNotArrayError,
    ArgumentParserNotAFunctionError,
    CliOptionsNotArrayError,
    MissingOptionFlagsError,
    OptionChoicesNotArrayError,
    OptionParserNotAFunctionError,
    DependenciesNotArrayError,
    MissingDependencyNameError,
    DuplicateDependencyError,
} from './errors.js'
import {Argument, Command, Option} from 'commander'
import {InputValueDelayedParser} from './InputValueDelayedParser.js'
import {dependencyDescriptor} from '../utils/dependenciesUtils.js'
import crypto from 'crypto'
import path from 'path'

export class ScriptHandler {

    static getOnCommanderPreAction(dependenciesVersions, scriptFolder, preAction) {
        return async (_thisCommand, _actionCommand) => {
            await preAction(dependenciesVersions, scriptFolder)
        }
    }

    static getOnCommanderAction(dependenciesNames, scriptFolder, runFunction, action) {
        return async (...args) => {
            const _command = args.pop()
            const cliOptions = args.pop()

            const {rawArguments, getArguments} = InputValueDelayedParser.prepareArguments(args)
            const {rawOptions, getOptions} = InputValueDelayedParser.prepareOptions(cliOptions)

            await action({
                dependencies: dependenciesNames,
                gushioFolder: scriptFolder,
                rawArguments,
                getArguments,
                rawOptions,
                getOptions,
                runFunction,
            })
        }
    }

    constructor(scriptPath, scriptObject) {
        this.scriptPath = scriptPath
        this.scriptObject = scriptObject
    }

    getDependenciesVersionsAndNames() {
        const dependencies = this.normalizeDependencies()
            .map(rawDep => dependencyDescriptor(rawDep.name, rawDep.version, rawDep.alias))

        return {
            versions: dependencies.map(d => d.npmInstallVersion),
            names: dependencies.map(d => d.name),
        }
    }

    getScriptFolder(gushioGeneralPath, cliName, cliVersion) {
        let folderName = crypto.createHash('md5').update(this.scriptPath).digest('hex').substring(0, 8)
        if (cliName) {
            folderName += `-${cliName}`
        }
        if (cliVersion) {
            folderName += `-${cliVersion}`
        }

        return path.resolve(gushioGeneralPath, folderName.replace(/\s+/g, '_'))
    }

    toCommand(gushioGeneralPath, preAction, action) {
        const runFunction = this.normalizeRunFunction()
        const normalizedCli = this.normalizeCliObject()
        const dependencies = this.getDependenciesVersionsAndNames()
        const scriptFolder = this.getScriptFolder(gushioGeneralPath, normalizedCli.name, normalizedCli.version)

        const command = new Command()
            .name(normalizedCli.name || this.scriptPath)
            .description(normalizedCli.description || '')
            .version(normalizedCli.version || '')
            .showSuggestionAfterError()

        if (normalizedCli.afterHelp) {
            command.addHelpText('after', `\n${normalizedCli.afterHelp}`)
        }

        for (const argument of normalizedCli.arguments) {
            command.addArgument(argument)
        }

        for (const option of normalizedCli.options) {
            command.addOption(option)
        }

        return command
            .hook('preAction', ScriptHandler.getOnCommanderPreAction(dependencies.versions, scriptFolder, preAction))
            .action(ScriptHandler.getOnCommanderAction(dependencies.names, scriptFolder, runFunction, action))
    }

    normalizeRunFunction() {
        if (!this.scriptObject.run) {
            throw new RunFunctionNotExportedError(this.scriptPath)
        }
        if (typeof this.scriptObject.run !== 'function') {
            throw new RunIsNotAFunctionError(this.scriptPath)
        }
        return this.scriptObject.run
    }

    normalizeCliObject() {
        const normalizedCli = {
            arguments: [],
            options: [],
        }

        if (this.scriptObject.cli) {
            normalizedCli.name = this.scriptObject.cli.name
            normalizedCli.description = this.scriptObject.cli.description
            normalizedCli.version = this.scriptObject.cli.version
            normalizedCli.afterHelp = this.scriptObject.cli.afterHelp

            if (this.scriptObject.cli.arguments) {
                if (!Array.isArray(this.scriptObject.cli.arguments)) {
                    throw new CliArgumentsNotArrayError(this.scriptPath)
                }

                for (const argument of this.scriptObject.cli.arguments) {
                    if (!argument.name) {
                        throw new MissingArgumentNameError(this.scriptPath)
                    }

                    const argumentObj = new Argument(argument.name, argument.description)

                    if (argument.choices) {
                        if (!Array.isArray(argument.choices)) {
                            throw new ArgumentChoicesNotArrayError(this.scriptPath, argument.name)
                        }
                        argumentObj.choices(argument.choices)
                    }

                    if (argument.parser) {
                        if (!(argument.parser instanceof Function)) {
                            throw new ArgumentParserNotAFunctionError(this.scriptPath, argument.name)
                        }

                        argumentObj.argParser(InputValueDelayedParser.commanderParserCallback(argument.parser))
                    }

                    if (argument.default) {
                        argumentObj.default(argument.default)
                    }
                    normalizedCli.arguments.push(argumentObj)
                }
            }

            if (this.scriptObject.cli.options) {
                if (!Array.isArray(this.scriptObject.cli.options)) {
                    throw new CliOptionsNotArrayError(this.scriptPath)
                }

                for (const option of this.scriptObject.cli.options) {
                    if (!option.flags) {
                        throw new MissingOptionFlagsError(this.scriptPath)
                    }

                    const optionObj = new Option(option.flags, option.description)

                    if (option.choices) {
                        if (!Array.isArray(option.choices)) {
                            throw new OptionChoicesNotArrayError(this.scriptPath, option.flags)
                        }
                        optionObj.choices(option.choices)
                    }

                    if (option.parser) {
                        if (!(option.parser instanceof Function)) {
                            throw new OptionParserNotAFunctionError(this.scriptPath, option.flags)
                        }
                        optionObj.argParser(InputValueDelayedParser.commanderParserCallback(option.parser))
                    }

                    if (option.default) {
                        optionObj.default(option.default)
                    }
                    if (option.env) {
                        optionObj.env(option.env)
                    }
                    normalizedCli.options.push(optionObj)
                }
            }
        }
        return normalizedCli
    }

    normalizeDependencies() {
        let dependencies = this.scriptObject.deps
        if (!dependencies) {
            dependencies = []
        }

        if (!Array.isArray(dependencies)) {
            throw new DependenciesNotArrayError(this.scriptPath)
        }

        for (const dependency of dependencies) {
            if (!dependency.name) {
                throw new MissingDependencyNameError(this.scriptPath)
            }
        }

        const duplicateCandidates = dependencies
            .map(d => d.name)
            .filter((item, index) => dependencies.indexOf(item) !== index)
        for (const duplicate of duplicateCandidates) {
            const dependencyDuplicates = dependencies.filter(dep => dep.name === duplicate)

            if (dependencyDuplicates.length !== new Set(dependencyDuplicates.map(dep => dep.alias)).size) {
                throw new DuplicateDependencyError(this.scriptPath, duplicate)
            }
        }

        return dependencies
    }
}