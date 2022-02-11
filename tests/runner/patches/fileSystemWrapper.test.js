import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('fileSystemWrapper', () => {
    let fileSystemWrapper, path, fsExtra, shelljs, glob

    beforeEach(async () => {
        path = jest.fn()
        jest.unstable_mockModule('path', () => ({default: path}))
        fsExtra = jest.fn()
        jest.unstable_mockModule('fs-extra', () => ({default: fsExtra}))
        shelljs = jest.fn()
        jest.unstable_mockModule('shelljs', () => ({default: shelljs}))
        glob = jest.fn()
        jest.unstable_mockModule('glob', () => ({default: glob}))

        fileSystemWrapper = (await import('../../../runner/patches/fileSystemWrapper')).fileSystemWrapper
    })

    test.each([
        true, false
    ])('fileSystemWrapper %p', async (isVerbose) => {
        path.dirname = jest.fn().mockImplementationOnce(() => 'scriptDir')
        fsExtra.readFile = jest.fn().mockImplementationOnce(() => 'fileContent')
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
            expect(global.__filename).toBe('scriptPath')
            expect(global.__dirname).toBe('scriptDir')
            expect(await global.fs.readFile('filePath')).toBe('fileContent')
            expect(await global.fs.glob('pattern1', {some: 'options'})).toStrictEqual(['globResult1', 'globResult2'])
            expect(await global.fs.glob('pattern2', {some: 'thing', cwd: 'other'})).toStrictEqual(['globResult1'])
            await expect(async () => await global.fs.glob('pattern3')).rejects.toThrow('Glob Error')

            expect(global.fs.path).toBe(path)
            return 'something'
        }

        expect(global.__filename).toBeUndefined()
        expect(global.__dirname).toBeUndefined()
        expect(global.fs).toBeUndefined()

        expect(await fileSystemWrapper('scriptPath', isVerbose).run(fn)).toBe('something')
        expect(path.dirname).toHaveBeenCalledTimes(1)
        expect(path.dirname).toHaveBeenCalledWith('scriptPath')
        expect(fsExtra.readFile).toHaveBeenCalledTimes(1)
        expect(fsExtra.readFile).toHaveBeenCalledWith('filePath')
        expect(shelljs.pwd).toHaveBeenCalledTimes(3)
        expect(glob).toHaveBeenCalledTimes(3)

        expect(global.__filename).toBeUndefined()
        expect(global.__dirname).toBeUndefined()
        expect(global.fs).toBeUndefined()
    })
})