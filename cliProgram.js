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

    async start() {
        try {
            await this.getCommand(process.cwd()).parseAsync(process.argv)
            process.exit(0)
        } catch (error) {
            this.logger.error(error.message)
            process.exit(error.errorCode || 1)
        }
    }
}

const start = () => {
    const {Logger} = require('./Logger')
    return new Program(new Logger()).start()
}

module.exports = {start, Program}