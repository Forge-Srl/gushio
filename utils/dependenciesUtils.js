const Module = require('module')
const shell = require('shelljs')

const buildPatchedRequire = (folder, allowedDependencies = []) => {
    // patchedRequire must be a `function` since will replace `require` which is actually a complex object!
    const patchedRequire = function (id) {
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

                throw new Error(`Dependency "${id}" has been required but is not available`)
            }
        }
    }
    patchedRequire.__originalRequire = Module.prototype.require
    return patchedRequire
}

const runWithPatchedRequire = async (patchedRequire, fn) => {
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

const ensureNodeModulesExists = async (folder) => new Promise((resolve, reject) => {
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