import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import * as URL from 'url'
import os from 'os'
import path from 'path'

describe('dependenciesUtils', () => {
    let shelljs, fsExtra, fetch, Arborist, mockRequireFromString, transformCode, requireStrategy, buildPatchedImport,
        dependencyDescriptor, ensureNodeModulesExists, installDependencies

    beforeEach(async () => {
        shelljs = {dummy: 'dummy'}
        jest.unstable_mockModule('shelljs', () => ({default: shelljs}))
        mockRequireFromString = jest.fn()
        jest.unstable_mockModule('require-from-string', () => ({default: mockRequireFromString}))
        fsExtra = jest.fn()
        jest.unstable_mockModule('fs-extra', () => ({default: fsExtra}))
        fetch = jest.fn()
        jest.unstable_mockModule('node-fetch', () => ({default: fetch}))
        Arborist = jest.fn()
        jest.unstable_mockModule('@npmcli/arborist', () => ({Arborist}))
        transformCode = jest.fn()
        jest.unstable_mockModule('../../utils/codeTransformationUtils.js', () => ({transformCode}))

        requireStrategy = (await import('../../utils/dependenciesUtils')).requireStrategy
        buildPatchedImport = (await import('../../utils/dependenciesUtils')).buildPatchedImport
        dependencyDescriptor = (await import('../../utils/dependenciesUtils')).dependencyDescriptor
        ensureNodeModulesExists = (await import('../../utils/dependenciesUtils')).ensureNodeModulesExists
        installDependencies = (await import('../../utils/dependenciesUtils')).installDependencies
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
        const scriptFolder = 'scriptFolder'
        const depsFolder = 'localFolder'
        let patchedImport

        beforeEach(() => {
            patchedImport = buildPatchedImport(scriptFolder, depsFolder, ['installed-fake-module'])
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
            {exports: 'index.js'},
            {exports: '/'},
            {exports: {import: 'index.js'}},
            {exports: {import: '/'}},
            {exports: {default: 'index.js'}},
            {exports: {default: '/'}},
            {exports: {'.': 'index.js'}},
            {exports: {'.': '/'}},
            {exports: {'.': {import: 'index.js'}}},
            {exports: {'.': {import: '/'}}},
            {exports: {'.': {import: null}}},
            {exports: {'.': {default: 'index.js'}}},
            {exports: {'.': {default: '/'}}},
            {exports: {'.': {default: null}}},
            {exports: {'.': {require: 'index.js'}}},
            {exports: {'.': {require: '/'}}},
            {exports: {'.': {require: null}}},
            {exports: 'index.js', module: 'other_ignored.js'},
            {exports: 'index.js', main: 'other_ignored.js'},
            {type: 'module', module: 'index.js'},
            {type: 'module', module: 'index'},
            {type: 'module', module: '/'},
            {type: 'commonjs', main: 'index.js'},
            {type: 'commonjs', main: 'index'},
            {type: 'commonjs', main: '/'},
            {type: 'commonjs', module: 'other_ignored.js', main: 'index.js'},
            {main: 'index.js', module: 'other_ignored.js'},
        ])('found in local folder %p', async (pkgStructure) => {
            const moduleMock = {default: 'theModule'}
            const moduleMockName = URL.fileURLToPath(`file://${os.platform() === 'win32' ? '' : 'localhost/'}${depsFolder}/node_modules/a-fake-module/index.js`)
            const moduleMockFactory = () => moduleMock
            const moduleMockOptions = {virtual: true}

            jest.mock(moduleMockName, moduleMockFactory, moduleMockOptions)
            jest.unstable_mockModule(moduleMockName, moduleMockFactory, moduleMockOptions)

            fsExtra.readJson = jest.fn().mockImplementationOnce((path) => {
                expect(path).toBe(`${depsFolder}/node_modules/a-fake-module/package.json`)
                return pkgStructure
            })
            fsExtra.pathExists = jest.fn().mockImplementation((path) => path.endsWith('.js'))

            expect(JSON.stringify(await patchedImport('a-fake-module'))).toStrictEqual(JSON.stringify(moduleMock))
            // call again to assert caching
            expect(JSON.stringify(await patchedImport('a-fake-module'))).toStrictEqual(JSON.stringify(moduleMock))
            expect(fsExtra.readJson).toHaveBeenCalledTimes(1)
        })

        test('custom local file', async () => {
            const moduleMock = {default: 'theModule'}
            const moduleMockFactory = () => moduleMock
            const moduleMockOptions = {virtual: true}

            const scriptName = `${os.platform() === 'win32' ? 'file://' : ''}${path.join(scriptFolder, 'some-script.js')}`

            jest.mock(scriptName, moduleMockFactory, moduleMockOptions)
            jest.unstable_mockModule(scriptName, moduleMockFactory, moduleMockOptions)

            expect(JSON.stringify(await patchedImport('./some-script.js'))).toStrictEqual(JSON.stringify(moduleMock))
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
        beforeEach(() => {
            fsExtra.remove = jest.fn()
            fsExtra.mkdirp = jest.fn()
        })

        test('clean', async () => {
            await expect(ensureNodeModulesExists('somePath', true)).resolves.toBeUndefined()
            expect(fsExtra.remove).toHaveBeenCalledWith('somePath')
            expect(fsExtra.mkdirp).toHaveBeenCalledWith('somePath/node_modules')
        })

        test('no clean', async () => {
            await expect(ensureNodeModulesExists('somePath', false)).resolves.toBeUndefined()
            expect(fsExtra.remove).not.toHaveBeenCalledWith('somePath')
            expect(fsExtra.mkdirp).toHaveBeenCalledWith('somePath/node_modules')
        })
    })

    test('installDependencies', async () => {
        const arborist = {
            reify: jest.fn().mockImplementationOnce(() => {
                process.emit('log', 'notice', 'msg1', 'msg2')
                process.emit('log', 'warn', 'msg3', 'msg4')
                process.emit('log', 'error', 'msg5', 'msg6')
                process.emit('log', 'info', 'msg7', 'msg8')
                process.emit('log', 'info', 'msg9', 'postinstall')
                process.emit('log', 'other', 'msg11', 'msg12')
            })
        }
        Arborist.mockReturnValueOnce(arborist)
        const console = {
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            verbose: jest.fn(),
        }

        await expect(installDependencies('somePath', ['pack1', 'pack2'], console)).resolves.toBeUndefined()
        expect(Arborist).toHaveBeenCalledWith({path: 'somePath'})
        expect(arborist.reify).toHaveBeenCalledWith({add: ['pack1', 'pack2']})
        expect(console.warn).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'msg1', 'msg2')
        expect(console.warn).toHaveBeenNthCalledWith(2, '[Gushio|Deps] %s', 'msg3', 'msg4')
        expect(console.error).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'msg5', 'msg6')
        expect(console.info).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'msg7', 'msg8')
        expect(console.verbose).toHaveBeenNthCalledWith(1, '[Gushio|Deps] %s', 'msg9', 'postinstall')
        expect(console.verbose).toHaveBeenNthCalledWith(2, '[Gushio|Deps] %s', 'msg11', 'msg12')
    })
})