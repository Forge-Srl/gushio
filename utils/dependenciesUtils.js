const shell = require('shelljs')

const requireScriptDependency = (dependency, localFolder) => {
    try {
        return require(dependency)
    } catch (e) {
        try {
            return require(`${localFolder}/node_modules/${dependency}`)
        } catch (e) {
            throw new Error(`Dependency "${dependency}" should be installed but was not found`)
        }
    }
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
    requireScriptDependency, dependencyDescriptor, ensureNodeModulesExists, checkDependencyInstalled, installDependency
}