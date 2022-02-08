export class ScriptError extends Error {
    constructor(message, errorCode) {
        super(message)
        this.errorCode = errorCode
    }
}

export class LoadingError extends ScriptError {
    static get code() {
        return 2
    }

    constructor(scriptPath, message) {
        super(`Error while loading '${scriptPath}': ${message}`, LoadingError.code)
    }
}

export class RunningError extends ScriptError {
    static get code() {
        return 1
    }

    constructor(scriptPath, message) {
        super(`Error while running '${scriptPath}': ${message}`, RunningError.code)
    }
}

export const parseSyntaxError = (error) => {
    const stackLines = error.stack.substring(0, error.stack.indexOf('    at '))
        .split('\n')
        .filter(l => l)

    const errorLine = stackLines.shift()
    const errorMessage = stackLines.pop()
    const errorDetails = stackLines.join('\n')

    return {
        line: Number.parseInt(errorLine.match(/^.*:(\d+)$/)[1]),
        message: errorMessage,
        details: errorDetails,
    }
}