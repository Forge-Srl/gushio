import path from 'path'
import fsExtra from 'fs-extra'
import glob from 'glob'
import shell from 'shelljs'
import {FunctionWrapper} from './FunctionWrapper.js'

export const fileSystemWrapper = (isVerbose) => {
    const originalFs = global.fs
    const before = () => {
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
    }

    return new FunctionWrapper(before, after)
}