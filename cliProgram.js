const {Command} = require('commander')
const path = require('path')
const {Runner} = require('./Runner')

const getProgram = (workingDir) => new Command()
    .name('gushio')
    .description('Run js files like you run bash scripts')
    .version('0.0.0')
    .option('-s, --script <path>', 'path to the script')
    .action(async (options, command) => {
        const scriptPath = options.script
        if (!scriptPath) {
            return
        }
        const resolvedScriptPath = path.resolve(workingDir, scriptPath)
        const runner = Runner.fromPath(command.rawArgs[1], resolvedScriptPath)
        await runner.run(command.args)
    })

const start = () => getProgram(process.cwd())
    .parseAsync(process.argv)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(error.errorCode || 1)
    })

module.exports = {start, getProgram}