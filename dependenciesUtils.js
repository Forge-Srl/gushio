const shell = require('shelljs')

const requireScriptDependency = (dependency, localFolder) => {
    try {
        return require(dependency)
    } catch (e) {
        try {
            return require(`${localFolder}/node_modules/${dependency}`)
        } catch (e) {
            throw new Error(`Dependency ${dependency} should be installed but was not found`)
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
    const exec = shell.mkdir('-p', `${folder}/node_modules`)
    if (exec.code === 0) {
        return resolve()
    }
    return reject(new Error(`Cannot create "${folder}/node_modules", mkdir failed with code ${exec.code}`))
})

const checkDependencyInstalled = async (folder, npmInstallVersion, silent = true) => new Promise((resolve, reject) => {
    const exec = shell.exec(`npm list --depth=0 --prefix ${folder} ${npmInstallVersion}`, {silent})
    if (exec.code === 0) {
        return resolve()
    }
    return reject(new Error(`Cannot find "${npmInstallVersion}" in "${folder}"`))
})

const installDependency = async (folder, npmInstallVersion, silent = true) => new Promise((resolve, reject) => {
    const exec = shell.exec(`npm install --prefix ${folder} ${npmInstallVersion}`, {silent})
    if (exec.code === 0) {
        return resolve()
    }
    return reject(new Error(`Installation of ${npmInstallVersion} failed with exit code ${exec.code}`))
})

module.exports = {requireScriptDependency, dependencyDescriptor, ensureNodeModulesExists, checkDependencyInstalled, installDependency}