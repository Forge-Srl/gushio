import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import {createRequire} from 'module'
import shelljs from 'shelljs'
import colors from 'ansi-colors'
import {withServer} from './withServer.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(require.resolve('./gushio.acceptance.test.js'))
const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')


function absoluteScript(scriptName) {
    return path.resolve(samplesDir, scriptName)
}
function runScript(tmpDir, scriptPathOrUrl, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${scriptPathOrUrl} ${argsAndOpts}`)
}
function expectCommandCode(result, expectedExitCode) {
    try {
        expect(result.code).toBe(expectedExitCode)
    } catch (e) {
        throw new Error(`${e.message}\n\nCommand stderr: ${result.stderr}\nCommand stdout: ${result.stdout}`)
    }
}

describe('Gushio', () => {
    let tmpDir

    beforeAll(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gushio-acceptance"))
        shelljs.cd(tmpDir)
    })

    afterAll(() => {
        fs.rmdirSync(tmpDir, {recursive: true})
    })

    describe('missing file', () => {
        test('local', () => {
            const result = runScript(tmpDir, absoluteScript('missing_file.js'))
            expectCommandCode(result, 2)
            expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*missing_file.js': ENOENT: no such file or directory, open '.*missing_file.js'*/)
        })

        test('remote', () => {
            const result = runScript(tmpDir, 'http://invalid.example.com/fake/path/missing_remote_file.js')
            expectCommandCode(result, 2)
            expect(result.stderr).toMatch(/^\[Gushio] Error while loading 'http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js': request to http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js failed, reason: getaddrinfo ENOTFOUND invalid.example.com\n$/)
        })
    })

    test('get remote script', async () => {
        await withServer(async server => {
            await server.on('GET', '/remote_file.js', 200, `module.exports = {run: async () => {console.log('Requested file')}}`)

            const result = runScript(tmpDir, `${await server.getBaseURL()}/remote_file.js`)
            expectCommandCode(result, 0)
            expect(result.stdout).toBe(`Requested file\n`)
        })
    })

    test('syntax error', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_syntax_error.js'))
        expectCommandCode(result, 2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*acceptance_sample_syntax_error.js': "SyntaxError: Unexpected token 'this'" at line 7\nIn this line there's JavaScript syntax error\n\s{3}\^\^\^\^\n$/)
    })

    test('throw error', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_throw_error.js'))
        expectCommandCode(result, 1)
        expect(result.stderr).toMatch(/^\[Gushio] Error while running '.*acceptance_sample_throw_error.js': This script can fail badly\n$/)
    })

    test('arguments check', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_arguments_check.js'), 'foo "bar a bar" quis quix quiz')
        expectCommandCode(result, 0)
        expect(result.stdout).toBe('These are the args: ["foo","bar a bar",["quis","quix","quiz"]]\n')
    })

    test('flags check', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_flags_check.js'), '-s 123 -s 456 789 -t --first "foo foo"')
        expectCommandCode(result, 0)
        expect(result.stdout).toBe('These are the options: {"second":["123","456","789"],"third":true,"first":"foo foo"}\n')
    })

    test('dependency installation', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_dependency_installation.js'))
        expectCommandCode(result, 0)
        expect(result.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency jimp@latest\n' +
            '[Gushio] Dependency jimp@latest successfully installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest successfully installed\n' +
            'Written on console ' + colors.yellow.bold('after') + ' requiring deps\n')

        const hash = crypto.createHash('md5').update(path.resolve(samplesDir, 'acceptance_sample_dependency_installation.js')).digest('hex').substring(0, 8)
        const installedDeps = shelljs.ls(`${tmpDir}/.gushio/${hash}-sample_5/node_modules`)
        expect(installedDeps).toContain('check-odd')
        expect(installedDeps).toContain('jimp')

        /* TODO: the second check fails on macOS with node >= 16
        // Now run again to check dependencies are already installed
        const result2 = runScript(tmpDir, 'acceptance_sample_dependency_installation.js')
        expectCommandCode(result, 0)
        expect(result2.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency jimp@latest\n' +
            '[Gushio] Dependency jimp@latest already installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest already installed\n' +
            'Written on console ' + colors.yellow.bold('after') + ' requiring deps\n')
         */
    }, 15000)

    test('shelljs', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_shelljs.js'))
        const expectedMessageTxt = `this is a message from acceptance_sample_1${os.EOL}`
        expectCommandCode(result, 0)
        expect(result.stdout).toBe(`You have a message to read...\nInside message.txt: "${expectedMessageTxt}"\n`)
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe(expectedMessageTxt)
    })

    test('global fetch', async () => {
        const fromTheServer = 'this text comes from the server'
        await withServer(async server => {
            await server.on('GET', '/remote_resource', 200, fromTheServer)

            const result = runScript(tmpDir, absoluteScript('acceptance_sample_global_fetch.js'), `${await server.getBaseURL()}/remote_resource`)
            expectCommandCode(result, 0)
            expect(result.stdout).toBe(`These is the remote resource: "${fromTheServer}"\n`)
        })
    })

    describe('directories', () => {
        let expectedTmpDir
        const scriptPath = absoluteScript('acceptance_sample_directories.js')

        beforeEach(() => {
            expectedTmpDir = process.platform === 'darwin' ? `/private${tmpDir}` : tmpDir
        })

        test('local', () => {
            const result = runScript(tmpDir, scriptPath)
            expectCommandCode(result, 0)
            expect(result.stdout).toBe(`__filename=${scriptPath}\n__dirname=${samplesDir}\nresolved=${scriptPath}\n$.pwd()=${expectedTmpDir}\nGlob "./*" [ './temp_folder' ]\n`)
        })

        test('remote', async () => {
            await withServer(async server => {
                await server.on('GET', '/remote_file.js', 200, fs.readFileSync(scriptPath).toString())

                const result = runScript(tmpDir, `${await server.getBaseURL()}/remote_file.js`)
                expectCommandCode(result, 0)
                expect(result.stdout).toBe(`__filename=\n__dirname=.\nresolved=${expectedTmpDir}\n$.pwd()=${expectedTmpDir}\nGlob "./*" [ './temp_folder' ]\n`)
            })
        })
    })

    test('run other script', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_run_other_script.js'))
        expectCommandCode(result, 0)
        expect(result.stdout).toBe(`Global Don't try this at home!\nBefore script run\n[Gushio] Checking dependencies\n[Gushio] Installing dependency is-odd@latest\n[Gushio] Dependency is-odd@latest successfully installed\nInner script begin\nGlobal Don't try this at home!\nArguments [ 'first', \`second "with" 'spaces'\` ]\nOptions { asd: true, bsd: \`something "else" 'with' spaces\` }\nInner script end\nAfter script run\nGlobal changed\n`)
    })
})