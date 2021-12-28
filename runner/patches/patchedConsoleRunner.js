const {FunctionRunner} = require('./FunctionRunner')

const patchedConsoleRunner = (patchedConsole) => {
    const originalConsole = global.console
    const before = () => {
        global.console = patchedConsole
    }
    const after = () => {
        global.console = originalConsole
    }

    return new FunctionRunner(before, after)
}

module.exports = {patchedConsoleRunner}