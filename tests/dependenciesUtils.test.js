describe('dependenciesUtils', () => {
    let shelljs, requireScriptDependency, dependencyDescriptor, ensureNodeModulesExists, checkDependencyInstalled,
        installDependency

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        jest.mock('shelljs', () => ({dummy: 'dummy'}))
        shelljs = require('shelljs')

        requireScriptDependency = require('../dependenciesUtils').requireScriptDependency
        dependencyDescriptor = require('../dependenciesUtils').dependencyDescriptor
        ensureNodeModulesExists = require('../dependenciesUtils').ensureNodeModulesExists
        checkDependencyInstalled = require('../dependenciesUtils').checkDependencyInstalled
        installDependency = require('../dependenciesUtils').installDependency
    })

    describe('requireScriptDependency', () => {
        test('not found', () => {
            expect(() => requireScriptDependency('a-fake-module', 'localFolder'))
                .toThrow('Dependency a-fake-module should be installed but was not found')
        })

        test('found', () => {
            jest.mock('a-fake-module', () => 'theModule', {virtual: true})
            expect(requireScriptDependency('a-fake-module', null)).toBe('theModule')
        })

        test('found in local folder', () => {
            jest.mock('localFolder/node_modules/a-fake-module', () => 'theModule', {virtual: true})
            expect(requireScriptDependency('a-fake-module', 'localFolder')).toBe('theModule')
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
        test('success', async () => {
            shelljs.mkdir = (flag, path) => {
                expect(flag).toBe('-p')
                expect(path).toBe('somePath/node_modules')
                return {code: 0}
            }
            await expect(ensureNodeModulesExists('somePath')).resolves.toBeUndefined()
        })

        test('failure', async () => {
            shelljs.mkdir = (flag, path) => {
                expect(flag).toBe('-p')
                expect(path).toBe('somePath/node_modules')
                return {code: 34}
            }
            await expect(ensureNodeModulesExists('somePath')).rejects
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
                .toThrow('Installation of somePackage failed with exit code 34')
        })
    })
})