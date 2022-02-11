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

    const errorMessage = stackLines.pop()
    let errorLine = -1
    let errorDetails = ''
    if (stackLines.length) {
        errorLine = Number.parseInt(stackLines.shift().match(/^.*:(\d+)$/)[1])
        errorDetails = stackLines.join('\n')
    }

    return {
        line: errorLine,
        message: errorMessage,
        details: errorDetails,
    }
}