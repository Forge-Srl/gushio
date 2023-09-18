import path from 'path'
import os from 'os'
import fsExtra from 'fs-extra'
import shell from 'shelljs'
import requireFromString from 'require-from-string'
import fetch from 'node-fetch'
import isString from 'is-string'
import {transformCode} from './codeTransformationUtils.js'
import {GushioDepsLogFormat} from '../runner/GushioConsole.js'
import {Arborist} from '@npmcli/arborist'

export const requireStrategy = {
    inMemoryString: async (code, filename, trace) => {
        code = await transformCode(code, trace)
        try {
            return await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`)
        } catch (e) {
            return requireFromString(code, filename)
        }
    },
    localPath: async (path, trace) => {
        const file = await fsExtra.readFile(path)
        return requireStrategy.inMemoryString(file.toString(), path, trace)
    },
    remotePath: async (path, trace) => {
        const response = await fetch(path)
        if (!response.ok) {
            throw new Error(`Request of "${path}" failed with status code ${response.status}`)
        }
        return requireStrategy.inMemoryString(await response.text(), null, trace)
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

export const ensureNodeModulesExists = async (folder, clear) => {
    if (clear) {
        await fsExtra.remove(folder)
    }
    await fsExtra.mkdirp(`${folder}/node_modules`)
}

export const installDependencies = async (folder, dependencies, console) => {
    const listener = (level, ...args) => {
        switch (level) {
            case 'notice':
            case 'warn':
                console.warn(GushioDepsLogFormat, ...args)
                break

            case 'error':
                console.error(GushioDepsLogFormat, ...args)
                break

            case 'info':
                console.info(GushioDepsLogFormat, ...args)
                break

            default:
                console.verbose(GushioDepsLogFormat, ...args)
                break
        }
    }
    process.on('log', listener)
    const arborist = new Arborist({path: folder})
    await arborist.reify({add: dependencies})
    process.off('log', listener)
}
