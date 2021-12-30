const {FunctionRunner} = require('./FunctionRunner')
const fsExtra = require('fs-extra')

const fileSystemRunner = () => {
    const originalFs = global.fs
    const before = () => {
        global.fs = fsExtra
    }
    const after = () => {
        global.fs = originalFs
    }

    return new FunctionRunner(before, after)
}

module.exports = {fileSystemRunner}