import path from 'path'
import os from 'os'
import fsExtra from 'fs-extra'
import shell from 'shelljs'
import requireFromString from 'require-from-string'
import fetch from 'node-fetch'
import isString from 'is-string'

export const requireStrategy = {
    inMemoryString: async (code, filename) => {
        try {
            return await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`)
        } catch (e) {
            return requireFromString(code, filename)
        }
    },
    localPath: async (path) => {
        const file = await fsExtra.readFile(path)
        return requireStrategy.inMemoryString(file.toString(), path)
    },
    remotePath: async (path) => {
        const response = await fetch(path)
        if (!response.ok) {
            throw new Error(`Request of "${path}" failed with status code ${response.status}`)
        }
        return requireStrategy.inMemoryString(await response.text(), null)
    },
}

const packageEntryPoint = async (pathToPackageFolder) => {
    const pkg = await fsExtra.readJson(`${pathToPackageFolder}/package.json`)

    let entryPoint = pkg.main
    if (!entryPoint && pkg.exports) {
        if (isString(pkg.exports)) {
            entryPoint = pkg.exports
        } else if (isString(pkg.exports['import'])) {
            entryPoint = pkg.exports['import']
        } else if (isString(pkg.exports['.'])) {
            entryPoint = pkg.exports['.']
        } else if (pkg.exports['.'] && isString(pkg.exports['.']['import'])) {
            entryPoint = pkg.exports['.']['import']
        }
    }

    if (!entryPoint) {
        entryPoint = 'index.js'
    } else if (entryPoint.endsWith('/')) {
        entryPoint += 'index.js'
    }

    const completePath = path.join(pathToPackageFolder, entryPoint)
    return os.platform() === 'win32' ? `file://${completePath}` : `file://localhost/${completePath}`
}

export const buildPatchedImport = (folder, allowedDependencies = [], silent) => {
    const importCache = new Map()
    const storeAndGet = (id, value) => {
        importCache.set(id, value)
        return value
    }

    importCache.set('shelljs', shell)

    return async id => {
        if (importCache.has(id)) {
            return importCache.get(id)
        }

        try {
            return storeAndGet(id, await import(id))
        } catch (e) {
            try {
                const entryPoint = await packageEntryPoint(`${folder}/node_modules/${id}`)
                return storeAndGet(id, await import(entryPoint))
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
}

export const dependencyDescriptor = (name, version = 'latest', alias) => {
    const depString = `${name}@${version}`
    if (alias) {
        return {name: alias, npmInstallVersion: `${alias}@npm:${depString}`}
    }
    return {name: name, npmInstallVersion: depString}
}

export const ensureNodeModulesExists = async (folder, clear) => new Promise((resolve, reject) => {
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

export const checkDependencyInstalled = async (folder, npmInstallVersion, silent = true) =>
    new Promise((resolve, reject) => {
        const exec = shell.exec(`npm list --depth=0 --prefix ${folder} ${npmInstallVersion}`, {silent})
        if (exec.code !== 0) {
            reject(new Error(`Cannot find "${npmInstallVersion}" in "${folder}"`))
            return
        }
        resolve()
    })

export const installDependency = async (folder, npmInstallVersion, silent = true) => new Promise((resolve, reject) => {
    const exec = shell.exec(`npm install --prefix ${folder} ${npmInstallVersion}`, {silent})
    if (exec.code !== 0) {
        reject(new Error(`Installation of "${npmInstallVersion}" failed with exit code ${exec.code}`))
        return
    }
    resolve()
})