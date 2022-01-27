describe('fetchWrapper', () => {
    let fileSystemWrapper, fsExtra, shelljs, glob

    beforeEach(() => {
        jest.mock('fs-extra')
        fsExtra = require('fs-extra')
        jest.mock('shelljs')
        shelljs = require('shelljs')
        jest.mock('glob')
        glob = require('glob')
        fileSystemWrapper = require('../../../runner/patches/fileSystemWrapper').fileSystemWrapper
    })

    test.each([
        true, false
    ])('fetchWrapper %p', async (isVerbose) => {
        fsExtra.readFile.mockImplementationOnce(() => 'fileContent')
        shelljs.pwd = jest.fn().mockImplementation(() => 'workingDir')
        glob.mockImplementationOnce((pattern, options, callback) => {
            expect(pattern).toBe('pattern1')
            expect(options).toStrictEqual({
                cwd: 'workingDir',
                debug: isVerbose,
                fs: fsExtra,
                some: 'options'
            })
            callback(null, ['globResult1', 'globResult2'])
        }).mockImplementationOnce((pattern, options, callback) => {
            expect(pattern).toBe('pattern2')
            expect(options).toStrictEqual({
                cwd: 'other',
                debug: isVerbose,
                fs: fsExtra,
                some: 'thing'
            })
            callback(null, ['globResult1'])
        }).mockImplementationOnce((pattern, options, callback) => {
            expect(pattern).toBe('pattern3')
            expect(options).toStrictEqual({
                cwd: 'workingDir',
                debug: isVerbose,
                fs: fsExtra,
            })
            callback(new Error('Glob Error'), null)
        })

        const fn = async () => {
            expect(await global.fs.readFile('filePath')).toBe('fileContent')
            expect(await global.fs.glob('pattern1', {some: 'options'})).toStrictEqual(['globResult1', 'globResult2'])
            expect(await global.fs.glob('pattern2', {some: 'thing', cwd: 'other'})).toStrictEqual(['globResult1'])
            await expect(async () => await global.fs.glob('pattern3')).rejects.toThrow('Glob Error')

            expect(global.fs.path).toBe(require('path'))
            return 'something'
        }
        expect(global.fs).toBeUndefined()
        expect(await fileSystemWrapper(isVerbose).run(fn)).toBe('something')
        expect(fsExtra.readFile).toHaveBeenCalledTimes(1)
        expect(fsExtra.readFile).toHaveBeenCalledWith('filePath')
        expect(shelljs.pwd).toHaveBeenCalledTimes(3)
        expect(glob).toHaveBeenCalledTimes(3)
        expect(global.fs).toBeUndefined()
    })
})