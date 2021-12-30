const {FunctionWrapper} = require('./FunctionWrapper')
const fsExtra = require('fs-extra')

const fileSystemWrapper = () => {
    const originalFs = global.fs
    const before = () => {
        global.fs = fsExtra
    }
    const after = () => {
        global.fs = originalFs
    }

    return new FunctionWrapper(before, after)
}

module.exports = {fileSystemWrapper}