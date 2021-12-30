describe('fetchRunner', () => {
    let fileSystemRunner, fsExtra

    beforeEach(() => {
        jest.mock('fs-extra')
        fsExtra = require('fs-extra')
        fileSystemRunner = require('../../../runner/patches/fileSystemRunner').fileSystemRunner
    })

    test('fetchRunner', async () => {
        fsExtra.readFile.mockImplementationOnce(() => 'fileContent')
        const fn = async () => {
            expect(await global.fs.readFile('filePath')).toBe('fileContent')
            return 'something'
        }
        expect(global.fs).toBeUndefined()
        expect(await fileSystemRunner().run(fn)).toBe('something')
        expect(fsExtra.readFile).toHaveBeenCalledTimes(1)
        expect(fsExtra.readFile).toHaveBeenCalledWith('filePath')
        expect(global.fs).toBeUndefined()
    })
})