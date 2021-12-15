const {Command, Option} = require('commander')
const path = require('path')
const os = require('os')
const packageInfo = require('../package.json')
const {Runner} = require('../runner/Runner')
const {RunningError, LoadingError} = require('../runner/errors')
const GUSHIO_FOLDER_NAME = '.gushio'

class Program {

    constructor(logger) {
        this.logger = logger
    }

    commandAction(workingDir) {
        return async (scriptPath, options, command) => {
            const absoluteScriptPath = path.resolve(workingDir, scriptPath)
            const runner = Runner.fromPath(command.rawArgs[1], absoluteScriptPath, options.gushioFolder)
                .setLogger(this.logger)
                .setOptions({verboseLogging: options.verbose})
            const _removedScriptPathArg = command.args.shift()
            await runner.run(command.args)
        }
    }

    getCommand(workingDir) {
        const verboseOption = new Option('-v, --verbose', 'enable verbose logging')
            .env('GUSHIO_VERBOSE')
        const gushioFolderOption = new Option('-f, --gushio-folder <folder>', 'path to the gushio cache folder')
            .env('GUSHIO_FOLDER')
            .default(path.resolve(os.homedir(), GUSHIO_FOLDER_NAME))

        return new Command()
            .name(packageInfo.name)
            .description(packageInfo.description)
            .version(packageInfo.version)
            .enablePositionalOptions()
            .passThroughOptions()
            .argument('<script>', 'path to the script')
            .addOption(verboseOption)
            .addOption(gushioFolderOption)
            .action(this.commandAction(workingDir))
    }

    async start(cwd, argv) {
        try {
            await this.getCommand(cwd).parseAsync(argv)
            return 0
        } catch (error) {
            if (error instanceof RunningError || error instanceof LoadingError) {
                this.logger.error(error.message)
            } else {
                this.logger.error(error.stack)
            }
            return error.errorCode || 1
        }
    }
}

const start = () => {
    const {Logger} = require('../utils/Logger')
    return new Program(new Logger())
        .start(process.cwd(), process.argv)
        .then(exitCode => process.exit(exitCode))
}

module.exports = {start, Program}