describe('dependenciesUtils', () => {
    let shelljs, buildPatchedRequire, patchedRequireRunner, dependencyDescriptor, ensureNodeModulesExists,
        checkDependencyInstalled, installDependency, Module

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        jest.mock('shelljs', () => ({dummy: 'dummy'}))
        shelljs = require('shelljs')

        Module = require('module')

        buildPatchedRequire = require('../../utils/dependenciesUtils').buildPatchedRequire
        patchedRequireRunner = require('../../utils/dependenciesUtils').patchedRequireRunner
        dependencyDescriptor = require('../../utils/dependenciesUtils').dependencyDescriptor
        ensureNodeModulesExists = require('../../utils/dependenciesUtils').ensureNodeModulesExists
        checkDependencyInstalled = require('../../utils/dependenciesUtils').checkDependencyInstalled
        installDependency = require('../../utils/dependenciesUtils').installDependency
    })

    describe('buildPatchedRequire', () => {
        let patchedRequire

        beforeEach(() => {
            patchedRequire = buildPatchedRequire('localFolder', ['installed-fake-module'])
            expect(patchedRequire.__originalRequire).toBe(Module.prototype.require)
        })

        test('not found', () => {
            patchedRequire.__originalRequire = function(id) {
                expect(id).toBe('installed-fake-module')
                throw new Error()
            }
            expect(() => patchedRequire('installed-fake-module'))
                .toThrow('Dependency "installed-fake-module" should be installed but was not found')
        })

        test('not available', () => {
            patchedRequire.__originalRequire = function(id) {
                expect(id).toBe('other-fake-module')
                throw new Error()
            }
            expect(() => patchedRequire('other-fake-module'))
                .toThrow('Dependency "other-fake-module" has been required but is not available')
        })

        test.each([
            'shelljs', 'enquirer'
        ])('found %s', (dep) => {
            patchedRequire.__originalRequire = undefined
            expect(patchedRequire(dep)).toBe(require(dep))
        })

        test('found in local folder', () => {
            patchedRequire.__originalRequire = function(id) {
                expect(id).toBe('localFolder/node_modules/a-fake-module')
                return 'theModule'
            }
            expect(patchedRequire('a-fake-module')).toBe('theModule')
        })
    })

    test('patchedRequireRunner', async () => {
        const patched = {__originalRequire: 'original'}
        const runPatched = patchedRequireRunner(patched)
        expect(Module.prototype.require).not.toBe(patched)
        const result = await runPatched.run(async () => {
            expect(Module.prototype.require).toBe(patched)
            return 'someValue'
        })
        expect(Module.prototype.require).toBe('original')
        expect(result).toBe('someValue')
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