const Module = require('module')
const shell = require('shelljs')
const ansiColors = require('ansi-colors')
const enquirer = require('enquirer')

const buildPatchedRequire = (folder, allowedDependencies = [], silent) => {
    // patchedRequire must be a `function` since will replace `require` which is actually a complex object!
    const patchedRequire = function (id) {
        switch (id) {
            case 'shelljs':
                return shell
            case 'ansi-colors':
                return ansiColors
            case 'enquirer':
                return enquirer
        }

        const require = patchedRequire.__originalRequire.bind(this)

        try {
            return require(id)
        } catch (e) {
            try {
                return require(`${folder}/node_modules/${id}`)
            } catch (e) {
                if (allowedDependencies.includes(id)) {
                    throw new Error(`Dependency "${id}" should be installed but was not found`)
                }

                let message = `Dependency "${id}" has been required but is not available`
                if (!silent) {
                    message += `\n${e.stack}`
                }
                throw new Error(message)
            }
        }
    }
    patchedRequire.__originalRequire = Module.prototype.require
    return patchedRequire
}

const runWithPatchedRequire = (patchedRequire) => async (fn) => {
    // Clear modules cache to ensure patchedRequire is clean
    for (const cacheKey in require.cache) {
        delete require.cache[cacheKey]
    }

    Module.prototype.require = patchedRequire
    const result = await fn()
    Module.prototype.require = patchedRequire.__originalRequire
    return result
}

const dependencyDescriptor = (name, version = 'latest', alias) => {
    const depString = `${name}@${version}`
    if (alias) {
        return {name: alias, npmInstallVersion: `${alias}@npm:${depString}`}
    }
    return {name: name, npmInstallVersion: depString}
}

const ensureNodeModulesExists = async (folder, clear) => new Promise((resolve, reject) => {
    if (clear) {
        const exec = shell.rm('-rf', folder)
        if (exec.code !== 0) {
            reject(new Error(`Cannot clear "${folder}", rm failed with code ${exec.code}`))
            return
        }
    }
    const nodeModuleFolder = `${folder}/node_modules`
    const exec = shell.mkdir('-p', nodeModuleFolder)
    if (exec.code !== 0) {
        reject(new Error(`Cannot create "${nodeModuleFolder}", mkdir failed with code ${exec.code}`))
        return
    }
    resolve()
})

const checkDependencyInstalled = async (folder, npmInstallVersion, silent = true) => new Promise((resolve, reject) => {
    const exec = shell.exec(`npm list --depth=0 --prefix ${folder} ${npmInstallVersion}`, {silent})
    if (exec.code !== 0) {
        reject(new Error(`Cannot find "${npmInstallVersion}" in "${folder}"`))
        return
    }
    resolve()
})

const installDependency = async (folder, npmInstallVersion, silent = true) => new Promise((resolve, reject) => {
    const exec = shell.exec(`npm install --prefix ${folder} ${npmInstallVersion}`, {silent})
    if (exec.code !== 0) {
        reject(new Error(`Installation of "${npmInstallVersion}" failed with exit code ${exec.code}`))
        return
    }
    resolve()
})

module.exports = {
    buildPatchedRequire,
    runWithPatchedRequire,
    dependencyDescriptor,
    ensureNodeModulesExists,
    checkDependencyInstalled,
    installDependency
}