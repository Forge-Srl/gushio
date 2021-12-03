const {LoadingError} = require('./errors')

class ScriptChecker {

    constructor(scriptPath) {
        this.scriptPath = scriptPath
    }

    checkScriptObject(scriptObject) {
        this.checkRunFunction(scriptObject.run)
        this.checkCliObject(scriptObject.cli)
        this.checkDependencies(scriptObject.deps)
    }

    checkRunFunction(runFunction) {
        if (!runFunction) {
            throw new LoadingError(this.scriptPath, 'run function is not exported')
        }
        if (typeof runFunction !== 'function') {
            throw new LoadingError(this.scriptPath, 'run is not a function')
        }
    }

    checkCliObject(cli) {
        if (!cli) {
            return
        }

        if (cli.arguments) {
            if (!Array.isArray(cli.arguments)) {
                throw new LoadingError(this.scriptPath, 'cli.arguments is not an Array')
            }

            for (const argument of cli.arguments) {
                if (!argument.name) {
                    throw new LoadingError(this.scriptPath, 'arguments must have a "name" field')
                }

                if (argument.choices && !Array.isArray(argument.choices)) {
                    throw new LoadingError(this.scriptPath, 'argument choices must be an Array of strings')
                }
            }
        }

        if (cli.options) {
            if (!Array.isArray(cli.options)) {
                throw new LoadingError(this.scriptPath, 'cli.options is not an Array')
            }

            for (const option of cli.options) {
                if (!option.flags) {
                    throw new LoadingError(this.scriptPath, 'options must have a "flags" field')
                }

                if (option.choices && !Array.isArray(option.choices)) {
                    throw new LoadingError(this.scriptPath, 'option choices must be an Array of strings')
                }
            }
        }
    }

    checkDependencies(dependencies) {
        if (!dependencies) {
            return
        }

        if (!Array.isArray(dependencies)) {
            throw new LoadingError(this.scriptPath, 'deps is not an Array')
        }

        for (const dependency of dependencies) {
            if (!dependency.name) {
                throw new LoadingError(this.scriptPath, 'dependencies must have a "name" field')
            }
        }

        const duplicateCandidates = dependencies
            .map(d => d.name)
            .filter((item, index) => dependencies.indexOf(item) !== index)
        for (const duplicate of duplicateCandidates) {
            const dependencyDuplicates = dependencies.filter(dep => dep.name === duplicate)

            if (dependencyDuplicates.length !== new Set(dependencyDuplicates.map(dep => dep.alias)).size) {
                throw new LoadingError(this.scriptPath, `dependency "${duplicate}" has been imported multiple times without different aliases`)
            }
        }
    }
}

module.exports = {ScriptChecker}