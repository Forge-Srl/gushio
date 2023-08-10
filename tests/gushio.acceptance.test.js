import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import {createRequire} from 'module'
import shelljs from 'shelljs'
import tempDirectory from 'temp-dir'
import {withServer} from './withServer.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(require.resolve('./gushio.acceptance.test.js'))
const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')

function absoluteScript(scriptName) {
    return path.resolve(samplesDir, scriptName)
}
function runScript(tmpDir, scriptPathOrUrl, argsAndOpts = '', gushioOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${gushioOpts} ${scriptPathOrUrl} ${argsAndOpts}`)
}
function scriptHash(scriptPath) {
    return crypto.createHash('md5').update(scriptPath).digest('hex').substring(0, 8)
}

function setupCustomSnapshotSerializer(replacements) {
    const replaceValues = (str) => {
        let result = str
        replacements.forEach(replacement => {
            const replacementElement = replacement[0] instanceof RegExp
                ? replacement[0]
                : new RegExp(replacement[0].replace(/\\/gum, '\\\\').replace(/\./gum, '\\.'), 'gum')
            result = result.replace(replacementElement, `[replace:${replacement[1]}]`)
        })
        return result
    }

    expect.addSnapshotSerializer({
        test: (value) =>
            value.code !== undefined && (!!value.stdout || !!value.stderr),
        print: (value) =>
            `@code: ${value.code}\n@out\n${replaceValues(value.stdout)}\n@err\n${replaceValues(value.stderr)}`
    })
}

function expectToMatchCustomSnapshot(result, replacements) {
    setupCustomSnapshotSerializer(replacements)
    expect(result).toMatchSnapshot()
}

describe('Gushio', () => {
    let tmpDir

    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(tempDirectory, 'gushio-acceptance'))
        shelljs.cd(tmpDir)
    })

    afterAll(async () => {
        await fs.rm(tmpDir, {recursive: true})
    })

    describe('missing file', () => {
        test('local', () => {
            const scriptPath = absoluteScript('missing_file.js')
            const result = runScript(tmpDir, scriptPath)
            expectToMatchCustomSnapshot(result, [
                [tmpDir, 'TMP_DIR'],
                [scriptPath, 'SCRIPT_PATH'],
            ])
        })

        test('remote', () => {
            const scriptPath = 'http://invalid.example.com/fake/path/missing_remote_file.js'
            const result = runScript(tmpDir, scriptPath)
            expectToMatchCustomSnapshot(result, [
                [tmpDir, 'TMP_DIR'],
                [scriptPath, 'SCRIPT_PATH'],
            ])
        })
    })

    test.each([
        'module.exports = {run: async () => {console.log("Requested file")}}',
        'export const run = async () => {console.log("Requested file")}'
    ])('get remote script "%s"', async (code) => {
        await withServer(async server => {
            await server.on('GET', '/remote_file.js', 200, code)

            const scriptPath = `${await server.getBaseURL()}/remote_file.js`
            const result = runScript(tmpDir, scriptPath)

            expectToMatchCustomSnapshot(result, [
                [tmpDir, 'TMP_DIR'],
                [scriptPath, 'SCRIPT_PATH'],
            ])
        })
    })

    test.each([
        'acceptance_sample_syntax_error.cjs',
        'acceptance_sample_syntax_error.mjs'
    ])('syntax error %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath)
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })

    test.each([
        'acceptance_sample_throw_error.cjs',
        'acceptance_sample_throw_error.mjs'
    ])('throw error %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath)
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })

    test.each([
        'acceptance_sample_arguments_check.cjs',
        'acceptance_sample_arguments_check.mjs'
    ])('arguments check %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath, 'foo "bar a bar" quis quix quiz')
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })

    test.each([
        'acceptance_sample_flags_check.cjs',
        'acceptance_sample_flags_check.mjs'
    ])('flags check %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath, '-s 123 -s 456 789 -t --first "foo foo"')
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })

    test.each([
        'acceptance_sample_dependency_installation.cjs',
        'acceptance_sample_dependency_installation.mjs'
    ])('dependency installation %s', (file) => {
        const scriptPath = absoluteScript(file)
        const hash = scriptHash(scriptPath)
        const result = runScript(tmpDir, scriptPath)
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [`${path.sep}.gushio${path.sep}${hash}`, 'gushio_SCRIPT_HASH'],
            [scriptPath, 'SCRIPT_PATH'],
        ])

        let installedDeps = shelljs.ls(`${tmpDir}/.gushio/${hash}-sample_5/node_modules`)
        expect(installedDeps).toContain('check-odd')
        expect(installedDeps).toContain('jimp')

        // Now run again to check dependencies are already installed
        const result2 = runScript(tmpDir, scriptPath)
        expectToMatchCustomSnapshot(result2, [
            [tmpDir, 'TMP_DIR'],
            [`${path.sep}.gushio${path.sep}${hash}`, 'gushio_SCRIPT_HASH'],
            [scriptPath, 'SCRIPT_PATH'],
        ])

        installedDeps = shelljs.ls(`${tmpDir}/.gushio/${hash}-sample_5/node_modules`)
        expect(installedDeps).toContain('check-odd')
        expect(installedDeps).toContain('jimp')
    }, 15000)

    test.each([
        'acceptance_sample_shelljs.cjs',
        'acceptance_sample_shelljs.mjs'
    ])('shelljs %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath)
        const expectedMessageTxt = `this is a message from acceptance_sample_1${os.EOL}`
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
            [expectedMessageTxt, 'EXPECTED_MESSAGE'],
        ])
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe(expectedMessageTxt)
        shelljs.rm('-rf', 'temp_folder')
    })

    test.each([
        'acceptance_sample_global_fetch.cjs',
        'acceptance_sample_global_fetch.mjs'
    ])('global fetch %s', async (file) => {
        await withServer(async server => {
            await server.on('GET', '/remote_resource', 200, 'this text comes from the server')

            const scriptPath = absoluteScript(file)
            const result = runScript(tmpDir, scriptPath, `${await server.getBaseURL()}/remote_resource`)
            expectToMatchCustomSnapshot(result, [
                [tmpDir, 'TMP_DIR'],
                [scriptPath, 'SCRIPT_PATH'],
            ])
        })
    })

    test.each([
        'acceptance_sample_global_timer.cjs',
        'acceptance_sample_global_timer.mjs'
    ])('global timer %s', async (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath)
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })

    describe.each([
        'acceptance_sample_directories.cjs',
        'acceptance_sample_directories.mjs'
    ])('directories %s', (file) => {
        const scriptPath = absoluteScript(file)

        beforeEach(() => {
            // Just add a bunch of files to test glob
            shelljs.touch('dummy_file1.txt')
            shelljs.touch('dummy_file2.md')
            shelljs.touch('other_dummy_file3.png')
        })

        afterEach(() => {
            shelljs.rm('dummy_file1.txt')
            shelljs.rm('dummy_file2.md')
            shelljs.rm('other_dummy_file3.png')
        })

        test('local', () => {
            const result = runScript(tmpDir, scriptPath)
            expectToMatchCustomSnapshot(result, [
                [tmpDir, 'TMP_DIR'],
                [scriptPath, 'SCRIPT_PATH'],
                [samplesDir, 'SAMPLES_DIR'],
            ])
        })

        test('remote', async () => {
            const fileContent = (await fs.readFile(scriptPath)).toString()
            await withServer(async server => {
                await server.on('GET', '/remote_file.js', 200, fileContent)

                const result = runScript(tmpDir, `${await server.getBaseURL()}/remote_file.js`)
                expectToMatchCustomSnapshot(result, [
                    [tmpDir, 'TMP_DIR'],
                    [scriptPath, 'SCRIPT_PATH'],
                    [samplesDir, 'SAMPLES_DIR'],
                ])
            })
        })
    })

    test.each([
        'acceptance_sample_run_other_script.cjs',
        'acceptance_sample_run_other_script.mjs'
    ])('run other script %s', (file) => {
        const scriptPath = absoluteScript(file)
        const innerScriptHash = scriptHash(absoluteScript('inner_script.js'))
        // force clear run because inner script will run twice and has dependencies
        const result = runScript(tmpDir, scriptPath, undefined, '-c')
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
            [`${path.sep}.gushio${path.sep}${innerScriptHash}`, 'gushio_INNER_SCRIPT_HASH'],
        ])
    })

    test.each([
        'acceptance_sample_trace_flag.cjs',
        'acceptance_sample_trace_flag.mjs'
    ])('run script with trace %s', (file) => {
        const scriptPath = absoluteScript(file)
        const result = runScript(tmpDir, scriptPath, undefined, '--trace')
        expectToMatchCustomSnapshot(result, [
            [tmpDir, 'TMP_DIR'],
            [scriptPath, 'SCRIPT_PATH'],
        ])
    })
})