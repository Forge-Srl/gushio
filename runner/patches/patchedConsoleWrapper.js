const {FunctionWrapper} = require('./FunctionWrapper')

const patchedConsoleWrapper = (patchedConsole) => {
    const originalConsole = global.console
    const before = () => {
        global.console = patchedConsole
    }
    const after = () => {
        global.console = originalConsole
    }

    return new FunctionWrapper(before, after)
}

module.exports = {patchedConsoleWrapper}