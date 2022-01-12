const fs = require('fs')
const os = require('os')
const path = require('path')
const shelljs = require('shelljs')
const colors = require('ansi-colors')
const crypto = require('crypto')

const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')
function runLocalScript(tmpDir, scriptName, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${samplesDir}/${scriptName} ${argsAndOpts}`)
}
function runRemoteScript(tmpDir, remoteScript, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${remoteScript} ${argsAndOpts}`)
}

describe('Gushio', () => {
    let tmpDir

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gushio-acceptance"))
        shelljs.cd(tmpDir)
    })

    afterEach(() => {
        fs.rmdirSync(tmpDir, {recursive: true})
    })

    test('missing local file', () => {
        const result = runLocalScript(tmpDir, 'missing_file.js')
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*missing_file.js': ENOENT: no such file or directory, open '.*missing_file.js'*/)
    })

    test('missing remote file', () => {
        const result = runRemoteScript(tmpDir, 'http://invalid.example.com/fake/path/missing_remote_file.js')
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading 'http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js': request to http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js failed, reason: getaddrinfo ENOTFOUND invalid.example.com\n$/)
    })

    test('syntax error', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_syntax_error.js')
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*acceptance_sample_syntax_error.js': "SyntaxError: Unexpected token 'this'" at line 7\nIn this line there's JavaScript syntax error\n\s{3}\^\^\^\^\n$/)
    })

    test('shelljs', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_shelljs.js')
        const expectedMessageTxt = `this is a message from acceptance_sample_1${os.EOL}`
        expect(result.code).toBe(0)
        expect(result.stdout).toBe(`You have a message to read...\nInside message.txt: "${expectedMessageTxt}"\n`)
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe(expectedMessageTxt)
    })

    test('throw error', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_throw_error.js')
        expect(result.code).toBe(1)
        expect(result.stderr).toMatch(/^\[Gushio] Error while running '.*acceptance_sample_throw_error.js': This script can fail badly\n$/)
    })

    test('arguments check', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_arguments_check.js', 'foo "bar a bar" quis quix quiz')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the args: ["foo","bar a bar",["quis","quix","quiz"]]\n')
    })

    test('flags check', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_flags_check.js', '-s 123 -s 456 789 -t --first "foo foo"')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the options: {"second":["123","456","789"],"third":true,"first":"foo foo"}\n')
    })

    test('dependency installation', () => {
        const result = runLocalScript(tmpDir, 'acceptance_sample_dependency_installation.js')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency glob@latest\n' +
            '[Gushio] Dependency glob@latest successfully installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest successfully installed\n' +
            'Written on console ' + colors.yellow.bold('after') + ' requiring deps\n')

        const hash = crypto.createHash('md5').update(path.resolve(samplesDir, 'acceptance_sample_dependency_installation.js')).digest('hex').substring(0, 8)
        const installedDeps = shelljs.ls(`${tmpDir}/.gushio/${hash}-sample_5/node_modules`)
        expect(installedDeps).toContain('check-odd')
        expect(installedDeps).toContain('glob')

        // Now run again to check dependencies are already installed

        const result2 = runLocalScript(tmpDir, 'acceptance_sample_dependency_installation.js')
        expect(result2.code).toBe(0)
        expect(result2.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency glob@latest\n' +
            '[Gushio] Dependency glob@latest already installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest already installed\n' +
            'Written on console ' + colors.yellow.bold('after') + ' requiring deps\n')
    }, 15000)
})