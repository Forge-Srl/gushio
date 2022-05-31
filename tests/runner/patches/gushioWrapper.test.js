import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {createRequire} from 'module'
const require = createRequire(import.meta.url)

describe('gushioWrapper', () => {
    let gushioWrapper, createRun, semverParse, packageInfo

    beforeEach(async () => {
        createRun = jest.fn()
        jest.unstable_mockModule('../../../utils/runUtils.js', () => ({createRun}))
        jest.unstable_mockModule('../../../runner/GushioConsole.js', () => ({traceSymbol: 'mockedTraceSymbol'}))
        semverParse = jest.fn()
        jest.unstable_mockModule('semver/functions/parse.js', () => ({default: semverParse}))

        packageInfo = require('../../../package.json')

        gushioWrapper = (await import('../../../runner/patches/gushioWrapper.js')).gushioWrapper
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
        const console = {
            ['mockedTraceSymbol']() {
                return 'trace'
            }
        }
        const fn = async () => {
            expect(global.gushio).toStrictEqual({
                run: 'gushioRun',
                version: 'semver',
                import: 'import',
                __trace__: expect.any(Function)
            })
            expect(global.gushio.__trace__()).toBe('trace')
            return 'something'
        }
        expect(global.gushio).toBeUndefined()
        expect(await gushioWrapper('runner', 'import', console).run(fn)).toBe('something')
        expect(global.gushio).toBeUndefined()
    })
})