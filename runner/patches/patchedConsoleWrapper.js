import {FunctionWrapper} from './FunctionWrapper.js'

export const patchedConsoleWrapper = (patchedConsole) => {
    const originalConsole = global.console
    const before = () => {
        global.console = patchedConsole
    }
    const after = () => {
        global.console = originalConsole
    }

    return new FunctionWrapper(before, after)
}