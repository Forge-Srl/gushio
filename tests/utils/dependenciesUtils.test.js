import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import * as URL from 'url'
import os from 'os'

describe('dependenciesUtils', () => {
    let shelljs, fsExtra, fetch, mockRequireFromString, transformCode, requireStrategy, buildPatchedImport,
        dependencyDescriptor, ensureNodeModulesExists, checkDependencyInstalled, installDependency

    beforeEach(async () => {
        shelljs = {dummy: 'dummy'}
        jest.unstable_mockModule('shelljs', () => ({default: shelljs}))
        mockRequireFromString = jest.fn()
        jest.unstable_mockModule('require-from-string', () => ({default: mockRequireFromString}))
        fsExtra = jest.fn()
        jest.unstable_mockModule('fs-extra', () => ({default: fsExtra}))
        fetch = jest.fn()
        jest.unstable_mockModule('node-fetch', () => ({default: fetch}))
        transformCode = jest.fn()
        jest.unstable_mockModule('../../utils/codeTransformationUtils.js', () => ({transformCode}))

        requireStrategy = (await import('../../utils/dependenciesUtils')).requireStrategy
        buildPatchedImport = (await import('../../utils/dependenciesUtils')).buildPatchedImport
        dependencyDescriptor = (await import('../../utils/dependenciesUtils')).dependencyDescriptor
        ensureNodeModulesExists = (await import('../../utils/dependenciesUtils')).ensureNodeModulesExists
        checkDependencyInstalled = (await import('../../utils/dependenciesUtils')).checkDependencyInstalled
        installDependency = (await import('../../utils/dependenciesUtils')).installDependency
    })

    describe('requireStrategy', () => {
        describe('inMemoryString', () => {
            const obj = {something: 'some value'}

            beforeEach(() => {
                transformCode.mockImplementationOnce((code, trace) => {
                    expect(trace).toBe('trace')
                    return code
                })
            })

            test('CJS', async () => {
                const codeAsCJS = 'module.exports = {something: "some value"}'
                mockRequireFromString.mockImplementationOnce(() => obj)

                expect(JSON.stringify(await requireStrategy.inMemoryString(codeAsCJS, 'filename', 'trace'))).toEqual(JSON.stringify(obj))
                expect(mockRequireFromString).toHaveBeenCalledWith(codeAsCJS, 'filename')
            })

            test('ESM', async () => {
                const codeAsESM = 'export const something = "some value"'
                expect(JSON.stringify(await requireStrategy.inMemoryString(codeAsESM, 'filename', 'trace')))
                    .toEqual(JSON.stringify(obj))
                expect(mockRequireFromString).not.toHaveBeenCalled()
            })
        })

        test('localPath', async () => {
            fsExtra.readFile = jest.fn().mockImplementationOnce(file => ({toString: () => 'someCode'}))
            requireStrategy.inMemoryString = (code, filename, trace) => {
                expect(code).toBe('someCode')
                expect(filename).toBe('someFile')
                expect(trace).toBe('trace')
                return 'required'
            }
            expect(await requireStrategy.localPath('someFile', 'trace')).toBe('required')
            expect(fsExtra.readFile).toHaveBeenCalledWith('someFile')
        })

        describe('remotePath', () => {
            test('OK', async () => {
                fetch.mockImplementationOnce(() => ({text: () => 'someCode', ok: true}))
                requireStrategy.inMemoryString = (code, filename, trace) => {
                    expect(code).toBe('someCode')
                    expect(filename).toBeNull()
                    expect(trace).toBe('trace')
                    return 'required'
                }
                expect(await requireStrategy.remotePath('remotePath', 'trace')).toBe('required')
                expect(fetch).toHaveBeenCalledWith('remotePath')
            })
            test('NOT FOUND', async () => {
                fetch.mockImplementationOnce(() => ({text: () => 'someCode', ok: false, status: 404}))
                await expect(() => requireStrategy.remotePath('remotePath', 'trace')).rejects
                    .toThrow('Request of "remotePath" failed with status code 404')
                expect(fetch).toHaveBeenCalledWith('remotePath')
            })
        })
    })

    describe('buildPatchedImport', () => {
        const folder = 'localFolder'
        let patchedImport

        beforeEach(() => {
            patchedImport = buildPatchedImport(folder, ['installed-fake-module'])
        })

        test('not found', async () => {
            await expect(patchedImport('installed-fake-module')).rejects
                .toThrow('Dependency "installed-fake-module" should be installed but was not found')
        })

        test('not available', async () => {
            await expect(patchedImport('other-fake-module')).rejects
                .toThrow('Dependency "other-fake-module" has been required but is not available')
        })

        test.each([
            'shelljs'
        ])('found %s', async (dep) => {
            expect(await patchedImport(dep)).toBe((await import(dep)).default)
        })

        test.each([
            'path',
            'os',
            'module'
        ])('found core module %s', async (dep) => {
            expect(await patchedImport(dep)).toBe(await import(dep))
        })

        test.each([
            {},
            {main: 'index.js'},
            {main: '/'},
            {exports: 'index.js'},
            {exports: '/'},
            {exports: {import: 'index.js'}},
            {exports: {import: '/'}},
            {exports: {'.': 'index.js'}},
            {exports: {'.': '/'}},
            {exports: {'.': {import: 'index.js'}}},
            {exports: {'.': {import: '/'}}},
            {exports: {'.': {import: null}}},
        ])('found in local folder %p', async (pkgStructure) => {
            const moduleMock = {default: 'theModule'}
            const moduleMockName = URL.fileURLToPath(`file://${os.platform() === 'win32' ? '' : 'localhost/'}${folder}/node_modules/a-fake-module/index.js`)
            const moduleMockFactory = () => moduleMock
            const moduleMockOptions = {virtual: true}

            jest.mock(moduleMockName, moduleMockFactory, moduleMockOptions)
            jest.unstable_mockModule(moduleMockName, moduleMockFactory, moduleMockOptions)

            fsExtra.readJson = jest.fn().mockImplementationOnce((path) => {
                expect(path).toBe(`${folder}/node_modules/a-fake-module/package.json`)
                return pkgStructure
            })

            expect(JSON.stringify(await patchedImport('a-fake-module'))).toStrictEqual(JSON.stringify(moduleMock))
            // call again to assert caching
            expect(JSON.stringify(await patchedImport('a-fake-module'))).toStrictEqual(JSON.stringify(moduleMock))
            expect(fsExtra.readJson).toHaveBeenCalledTimes(1)
        })
    })

    test.each([
        ['somePackage', '^1.0', 'pack-alias', {name: 'pack-alias', npmInstallVersion: 'pack-alias@npm:somePackage@^1.0'}],
        ['somePackage', undefined, 'pack-alias', {name: 'pack-alias', npmInstallVersion: 'pack-alias@npm:somePackage@latest'}],
        ['somePackage', '^1.0', undefined, {name: 'somePackage', npmInstallVersion: 'somePackage@^1.0'}],
        ['somePackage', undefined, undefined, {name: 'somePackage', npmInstallVersion: 'somePackage@latest'}],
    ])('dependencyDescriptor (%s, %s, %s)', (name, version, alias, expected) => {
        expect(dependencyDescriptor(name, version, alias)).toStrictEqual(expected)
    })

    describe('ensureNodeModulesExists', () => {
        test('clean success', async () => {
            shelljs.rm = (flag, path) => {
                expect(flag).toBe('-rf')
                expect(path).toBe('somePath')
                return {code: 0}
            }
            shelljs.mkdir = (flag, path) => {
                expect(flag).toBe('-p')
                expect(path).toBe('somePath/node_modules')
                return {code: 0}
            }
            await expect(ensureNodeModulesExists('somePath', true)).resolves.toBeUndefined()
        })

        test('no clear success', async () => {
            shelljs.mkdir = (flag, path) => {
                expect(flag).toBe('-p')
                expect(path).toBe('somePath/node_modules')
                return {code: 0}
            }
            await expect(ensureNodeModulesExists('somePath', false)).resolves.toBeUndefined()
        })

        test('clear failure', async () => {
            shelljs.rm = (flag, path) => {
                expect(flag).toBe('-rf')
                expect(path).toBe('somePath')
                return {code: 34}
            }
            await expect(ensureNodeModulesExists('somePath', true)).rejects
                .toThrow('Cannot clear "somePath", rm failed with code 34')
        })

        test('no clear failure', async () => {
            shelljs.mkdir = (flag, path) => {
                expect(flag).toBe('-p')
                expect(path).toBe('somePath/node_modules')
                return {code: 34}
            }
            await expect(ensureNodeModulesExists('somePath', false)).rejects
                .toThrow('Cannot create "somePath/node_modules", mkdir failed with code 34')
        })
    })

    describe('checkDependencyInstalled', () => {
        test('success', async () => {
            shelljs.exec = (command, options) => {
                expect(command).toBe('npm list --depth=0 --prefix somePath somePackage')
                expect(options).toStrictEqual({silent: false})
                return {code: 0}
            }
            await expect(checkDependencyInstalled('somePath', 'somePackage', false)).resolves.toBeUndefined()
        })

        test('failure', async () => {
            shelljs.exec = (command, options) => {
                expect(command).toBe('npm list --depth=0 --prefix somePath somePackage')
                expect(options).toStrictEqual({silent: false})
                return {code: 34}
            }
            await expect(checkDependencyInstalled('somePath', 'somePackage', false)).rejects
                .toThrow('Cannot find "somePackage" in "somePath"')
        })
    })

    describe('installDependency', () => {
        test('success', async () => {
            shelljs.exec = (command, options) => {
                expect(command).toBe('npm install --prefix somePath somePackage')
                expect(options).toStrictEqual({silent: false})
                return {code: 0}
            }
            await expect(installDependency('somePath', 'somePackage', false)).resolves.toBeUndefined()
        })

        test('failure', async () => {
            shelljs.exec = (command, options) => {
                expect(command).toBe('npm install --prefix somePath somePackage')
                expect(options).toStrictEqual({silent: false})
                return {code: 34}
            }
            await expect(installDependency('somePath', 'somePackage', false)).rejects
                .toThrow('Installation of "somePackage" failed with exit code 34')
        })
    })
})