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

export class RunFunctionNotExportedError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'run function is not exported')
    }
}

export class RunIsNotAFunctionError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'run is not a function')
    }
}

export class CliArgumentsNotArrayError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'cli.arguments is not an Array')
    }
}

export class MissingArgumentNameError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'all arguments must have a "name" field')
    }
}

export class ArgumentChoicesNotArrayError extends LoadingError {
    constructor(scriptPath, argument) {
        super(scriptPath, `choices of argument "${argument}" must be an Array of strings`)
    }
}

export class ArgumentParserNotAFunctionError extends LoadingError {
    constructor(scriptPath, argument) {
        super(scriptPath, `parser of argument "${argument}" must be a Function`)
    }
}

export class CliOptionsNotArrayError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'cli.options is not an Array')
    }
}

export class MissingOptionFlagsError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'all options must have a "flags" field')
    }
}

export class OptionChoicesNotArrayError extends LoadingError {
    constructor(scriptPath, option) {
        super(scriptPath, `choices of option "${option}" must be an Array of strings`)
    }
}

export class OptionParserNotAFunctionError extends LoadingError {
    constructor(scriptPath, option) {
        super(scriptPath, `parser of option "${option}" must be a Function`)
    }
}

export class DependenciesNotArrayError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'deps is not an Array')
    }
}

export class MissingDependencyNameError extends LoadingError {
    constructor(scriptPath) {
        super(scriptPath, 'dependencies must have a "name" field')
    }
}

export class DuplicateDependencyError extends LoadingError {
    constructor(scriptPath, dependency) {
        super(scriptPath, `dependency "${dependency}" has been imported multiple times without different aliases`)
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