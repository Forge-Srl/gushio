const {Command, Option} = require('commander')
const path = require('path')
const packageInfo = require('../package.json')
const {Runner} = require('../runner/Runner')

class Program {

    constructor(logger) {
        this.logger = logger
    }

    commandAction(workingDir) {
        return async (scriptPath, options, command) => {
            const runner = Runner.fromPath(command.rawArgs[1], path.resolve(workingDir, scriptPath))
                .setLogger(this.logger)
                .setOptions({verboseLogging: options.verbose})
            const _removedScriptPathArg = command.args.shift()
            await runner.run(workingDir, command.args)
        }
    }

    getCommand(workingDir) {
        return new Command()
            .name(packageInfo.name)
            .description(packageInfo.description)
            .version(packageInfo.version)
            .enablePositionalOptions()
            .passThroughOptions()
            .argument('<script>', 'path to the script')
            .addOption(new Option('-v, --verbose', 'enable verbose logging').env('GUSHIO_VERBOSE'))
            .action(this.commandAction(workingDir))
    }

    async start(cwd, argv) {
        try {
            await this.getCommand(cwd).parseAsync(argv)
            return 0
        } catch (error) {
            this.logger.error(error.message)
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