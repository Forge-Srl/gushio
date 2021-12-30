const {Command, Option} = require('commander')
const path = require('path')
const os = require('os')
const packageInfo = require('../package.json')
const {Runner} = require('../runner/Runner')
const {RunningError, LoadingError} = require('../runner/errors')
const {GushioConsole, GushioLogFormat} = require('../runner/GushioConsole')
const GUSHIO_FOLDER_NAME = '.gushio'

class Program {

    constructor(stdin, stdout, stderr) {
        this.stdin = stdin
        this.stdout = stdout
        this.stderr = stderr
    }

    buildConsole(logLevel) {
        return new GushioConsole(this.stdin, this.stdout, this.stderr, logLevel)
    }

    commandAction(workingDir) {
        return async (scriptPath, options, command) => {
            const console = this.buildConsole(options.verbose ? 'verbose' : 'info')

            try {
                const runner = (await Runner.fromPath(command.rawArgs[1], scriptPath, workingDir, options.gushioFolder))
                    .setConsole(console)
                    .setOptions({
                        cleanRun: options.cleanRun
                    })
                const _removedScriptPathArg = command.args.shift()

                await runner.run(command.args)
            } catch (error) {
                if (error instanceof LoadingError || error instanceof RunningError) {
                    console.error(GushioLogFormat, error.message)
                } else {
                    console.error(GushioLogFormat, error.stack)
                }
                throw error
            }
        }
    }

    getCommand(workingDir) {
        const verboseOption = new Option('-v, --verbose', 'enable verbose logging')
            .env('GUSHIO_VERBOSE')
        const gushioFolderOption = new Option('-f, --gushio-folder <folder>', 'path to the gushio cache folder')
            .env('GUSHIO_FOLDER')
            .default(path.resolve(os.homedir(), GUSHIO_FOLDER_NAME))
        const cleanRunOption = new Option('-c, --clean-run',
            'clear gushio cache folder before run (dependencies will be re-downloaded)')

        return new Command()
            .name(packageInfo.name)
            .description(packageInfo.description)
            .version(packageInfo.version)
            .enablePositionalOptions()
            .passThroughOptions()
            .argument('<script>', 'path to the script')
            .addOption(verboseOption)
            .addOption(gushioFolderOption)
            .addOption(cleanRunOption)
            .action(this.commandAction(workingDir))
    }

    async start(cwd, argv) {
        try {
            await this.getCommand(cwd).parseAsync(argv)
            return 0
        } catch (error) {
            // Error already logged inside `commandAction`. Now we just take the errorCode.
            return error.errorCode || 1
        }
    }
}

const start = () => {
    return new Program(process.stdin, process.stdout, process.stderr)
        .start(process.cwd(), process.argv)
        .then(exitCode => process.exit(exitCode))
}

module.exports = {start, Program}