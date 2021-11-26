class ScriptError extends Error {
    constructor(message, errorCode) {
        super(message)
        this.errorCode = errorCode
    }
}

class LoadingError extends ScriptError {
    static get code() {
        return 2
    }

    constructor(scriptPath, message) {
        super(`Error while loading '${scriptPath}': ${message}`, LoadingError.code)
    }
}

class RunningError extends ScriptError {
    static get code() {
        return 1
    }

    constructor(scriptPath, message) {
        super(`Error while running '${scriptPath}': ${message}`, RunningError.code)
    }
}

module.exports = {ScriptError, LoadingError, RunningError}