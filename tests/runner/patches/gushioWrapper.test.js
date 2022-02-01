describe('gushioWrapper', () => {
    let wrapper, createRun, semverParse, packageInfo

    beforeEach(() => {
        jest.mock('../../../utils/runUtils')
        createRun = require('../../../utils/runUtils').createRun
        jest.mock('semver/functions/parse')
        semverParse = require('semver/functions/parse')

        packageInfo = require('../../../package.json')

        wrapper = require('../../../runner/patches/gushioWrapper')
    })

    test('gushioWrapper', async () => {
        createRun.mockImplementationOnce((runner) => {
            expect(runner).toBe('runner')
            return 'gushioRun'
        })
        semverParse.mockImplementationOnce((version) => {
            expect(version).toBe(packageInfo.version)
            return 'semver'
        })

        const fn = async () => {
            expect(global.gushio).toStrictEqual({
                run: 'gushioRun',
                version: 'semver'
            })
            return 'something'
        }
        expect(global.gushio).toBeUndefined()
        expect(await wrapper.gushioWrapper('runner').run(fn)).toBe('something')
        expect(global.gushio).toBeUndefined()
    })
})