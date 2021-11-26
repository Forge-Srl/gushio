const {Command} = require('commander')
const path = require('path')
const {Runner} = require('./Runner')
const packageInfo = require('./package.json')

class Program {

    commandAction(workingDir) {
        return async (options, command) => {
            const scriptPath = options.script
            if (!scriptPath) {
                return
            }

            const runner = Runner.fromPath(command.rawArgs[1], path.resolve(workingDir, scriptPath))
            await runner.run(command.args)
        }
    }

    getCommand(workingDir) {
        return new Command()
            .name(packageInfo.name)
            .description(packageInfo.description)
            .version(packageInfo.version)
            .option('-s, --script <path>', 'path to the script')
            .action(this.commandAction(workingDir))
    }

    async start() {
        try {
            await this.getCommand(process.cwd()).parseAsync(process.argv)
            process.exit(0)
        } catch (error) {
            console.error(error)
            process.exit(error.errorCode || 1)
        }
    }
}

const start = () => new Program().start()

module.exports = {start, Program}