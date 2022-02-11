import path from 'path'
import fsExtra from 'fs-extra'
import glob from 'glob'
import shell from 'shelljs'
import {FunctionWrapper} from './FunctionWrapper.js'

export const fileSystemWrapper = (scriptPath, isVerbose) => {
    const originalFs = global.fs
    const originalDirname = global.__dirname
    const originalFilename = global.__filename
    const before = () => {
        global.__filename = scriptPath
        global.__dirname = path.dirname(global.__filename)
        global.fs = fsExtra
        global.fs.glob = async (pattern, options = {}) => {
            const defaultGlobOptions = {fs: fsExtra, cwd: shell.pwd().toString(), debug: isVerbose}
            const globOptions = Object.assign({}, defaultGlobOptions, options)

            return await new Promise((resolve, reject) => {
                glob(pattern, globOptions, (err, files) => err === null ? resolve(files) : reject(err))
            })
        }
        global.fs.path = path
    }
    const after = () => {
        global.fs = originalFs
        global.__filename = originalFilename
        global.__dirname = originalDirname
    }

    return new FunctionWrapper(before, after)
}