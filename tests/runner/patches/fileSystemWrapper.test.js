describe('fetchWrapper', () => {
    let fileSystemWrapper, fsExtra

    beforeEach(() => {
        jest.mock('fs-extra')
        fsExtra = require('fs-extra')
        fileSystemWrapper = require('../../../runner/patches/fileSystemWrapper').fileSystemWrapper
    })

    test('fetchWrapper', async () => {
        fsExtra.readFile.mockImplementationOnce(() => 'fileContent')
        const fn = async () => {
            expect(await global.fs.readFile('filePath')).toBe('fileContent')
            return 'something'
        }
        expect(global.fs).toBeUndefined()
        expect(await fileSystemWrapper().run(fn)).toBe('something')
        expect(fsExtra.readFile).toHaveBeenCalledTimes(1)
        expect(fsExtra.readFile).toHaveBeenCalledWith('filePath')
        expect(global.fs).toBeUndefined()
    })
})