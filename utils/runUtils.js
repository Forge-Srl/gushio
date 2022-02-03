const shell = require('shelljs')
const isString = require('is-string')
const {parseCommandLineArgsAndOpts} = require('./parsingUtils')

const createRun = (buildRunner) => async (script, argsAndOpts = []) => {
    const runner = await buildRunner(script, shell.pwd())

    let safeArgs
    if (Array.isArray(argsAndOpts)) {
        safeArgs = argsAndOpts
    } else if (isString(argsAndOpts)) {
        safeArgs = parseCommandLineArgsAndOpts(argsAndOpts)
    } else {
        throw new Error('argsAndOpts parameter is neither a string nor an array of strings')
    }

    await runner.run(safeArgs)
}

module.exports = {createRun}