const shell = require('shelljs')
const {parseCommandLineArgsAndOpts} = require('./parsingUtils')

const createRun = (buildRunner) => async (script, argsAndOpts = []) => {
    const runner = await buildRunner(script, shell.pwd())

    let safeArgs
    if (Array.isArray(argsAndOpts)) {
        safeArgs = argsAndOpts
    } else if (typeof argsAndOpts === 'string' || argsAndOpts instanceof String) {
        safeArgs = parseCommandLineArgsAndOpts(argsAndOpts)
    } else {
        throw new Error('argsAndOpts parameter is neither a string nor an array of strings')
    }

    await runner.run(safeArgs)
};

module.exports = {createRun}