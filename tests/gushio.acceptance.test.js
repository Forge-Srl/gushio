const fs = require('fs')
const os = require('os')
const path = require('path')
const shelljs = require('shelljs')
const colors = require('ansi-colors')
const crypto = require('crypto')
const {withServer} = require('./withServer')

const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')
function absoluteScript(scriptName) {
    return path.resolve(samplesDir, scriptName)
}
function runScript(tmpDir, scriptPathOrUrl, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${scriptPathOrUrl} ${argsAndOpts}`)
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

    describe('missing file', () => {
        test('local', () => {
            const result = runScript(tmpDir, absoluteScript('missing_file.js'))
            expect(result.code).toBe(2)
            expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*missing_file.js': ENOENT: no such file or directory, open '.*missing_file.js'*/)
        })

        test('remote', () => {
            const result = runScript(tmpDir, 'http://invalid.example.com/fake/path/missing_remote_file.js')
            expect(result.code).toBe(2)
            expect(result.stderr).toMatch(/^\[Gushio] Error while loading 'http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js': request to http:\/\/invalid.example.com\/fake\/path\/missing_remote_file.js failed, reason: getaddrinfo ENOTFOUND invalid.example.com\n$/)
        })
    })

    test('get remote script', async () => {
        await withServer(async server => {
            await server.on('GET', '/remote_file.js', 200, `module.exports = {run: async () => {console.log('Requested file')}}`)

            const result = runScript(tmpDir, `${await server.getBaseURL()}/remote_file.js`)
            expect(result.code).toBe(0)
            expect(result.stdout).toBe(`Requested file\n`)
        })
    })

    test('syntax error', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_syntax_error.js'))
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*acceptance_sample_syntax_error.js': "SyntaxError: Unexpected token 'this'" at line 7\nIn this line there's JavaScript syntax error\n\s{3}\^\^\^\^\n$/)
    })

    test('throw error', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_throw_error.js'))
        expect(result.code).toBe(1)
        expect(result.stderr).toMatch(/^\[Gushio] Error while running '.*acceptance_sample_throw_error.js': This script can fail badly\n$/)
    })

    test('arguments check', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_arguments_check.js'), 'foo "bar a bar" quis quix quiz')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the args: ["foo","bar a bar",["quis","quix","quiz"]]\n')
    })

    test('flags check', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_flags_check.js'), '-s 123 -s 456 789 -t --first "foo foo"')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the options: {"second":["123","456","789"],"third":true,"first":"foo foo"}\n')
    })

    test('dependency installation', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_dependency_installation.js'))
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

        /* TODO: the second check fails on macOS with node >= 16
        // Now run again to check dependencies are already installed
        const result2 = runScript(tmpDir, 'acceptance_sample_dependency_installation.js')
        expect(result2.code).toBe(0)
        expect(result2.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency glob@latest\n' +
            '[Gushio] Dependency glob@latest already installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest already installed\n' +
            'Written on console ' + colors.yellow.bold('after') + ' requiring deps\n')
         */
    }, 15000)

    test('shelljs', () => {
        const result = runScript(tmpDir, absoluteScript('acceptance_sample_shelljs.js'))
        const expectedMessageTxt = `this is a message from acceptance_sample_1${os.EOL}`
        expect(result.code).toBe(0)
        expect(result.stdout).toBe(`You have a message to read...\nInside message.txt: "${expectedMessageTxt}"\n`)
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe(expectedMessageTxt)
    })

    test('global fetch', async () => {
        const fromTheServer = 'this text comes from the server'
        await withServer(async server => {
            await server.on('GET', '/remote_resource', 200, fromTheServer)

            const result = runScript(tmpDir, absoluteScript('acceptance_sample_global_fetch.js'), `${await server.getBaseURL()}/remote_resource`)
            expect(result.code).toBe(0)
            expect(result.stdout).toBe(`These is the remote resource: "${fromTheServer}"\n`)
        })
    })

    describe('directories', () => {
        const scriptPath = absoluteScript('acceptance_sample_directories.js')

        test('local', () => {
            const result = runScript(tmpDir, scriptPath)
            expect(result.code).toBe(0)
            expect(result.stdout).toBe(`__filename=${scriptPath}\n__dirname=${samplesDir}\nresolved=${scriptPath}\n$.pwd()=${tmpDir}\n`)
        })

        test('remote', async () => {
            await withServer(async server => {
                await server.on('GET', '/remote_file.js', 200, fs.readFileSync(scriptPath).toString())

                const result = runScript(tmpDir, `${await server.getBaseURL()}/remote_file.js`)
                expect(result.code).toBe(0)
                expect(result.stdout).toBe(`__filename=\n__dirname=.\nresolved=${tmpDir}\n$.pwd()=${tmpDir}\n`)
            })
        })
    })
})