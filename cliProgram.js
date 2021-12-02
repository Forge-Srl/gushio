const {Command} = require('commander')
const path = require('path')
const packageInfo = require('./package.json')
const {Runner} = require('./Runner')

class Program {

    constructor(logger) {
        this.logger = logger
    }

    commandAction(workingDir) {
        return async (options, command) => {
            const scriptPath = options.script
            if (!scriptPath) {
                return
            }

            const runner = Runner.fromPath(command.rawArgs[1], path.resolve(workingDir, scriptPath))
                .setLogger(this.logger)
                .setOptions({verboseLogging: options.verbose})
            await runner.run(command.args)
        }
    }

    getCommand(workingDir) {
        return new Command()
            .name(packageInfo.name)
            .description(packageInfo.description)
            .version(packageInfo.version)
            .option('-s, --script <path>', 'path to the script')
            .option('-v, --verbose', 'enable verbose logging')
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
    const {Logger} = require('./Logger')
    return new Program(new Logger())
        .start(process.cwd(), process.argv)
        .then(exitCode => process.exit(exitCode))
}

module.exports = {start, Program}