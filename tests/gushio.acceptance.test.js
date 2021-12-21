const fs = require('fs')
const os = require('os')
const path = require('path')
const shelljs = require('shelljs')

const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')
function runScript(tmpDir, scriptName, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -f ${tmpDir}/.gushio ${samplesDir}/${scriptName}.js ${argsAndOpts}`)
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

    test('missing_file.js', () => {
        const result = runScript(tmpDir, 'missing_file')
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*missing_file.js': file not found\n$/)
    })

    test('acceptance_sample_0.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_0')
        expect(result.code).toBe(2)
        expect(result.stderr).toMatch(/^\[Gushio] Error while loading '.*acceptance_sample_0.js': "SyntaxError: Unexpected token 'this'" at line 7\nIn this line there's JavaScript syntax error\n\s{3}\^\^\^\^\n$/)
    })

    test('acceptance_sample_1.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_1')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('You have a message to read...\n')
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe(`this is a message from acceptance_sample_1${os.EOL}`)
    })

    test('acceptance_sample_2.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_2')
        expect(result.code).toBe(1)
        expect(result.stderr).toMatch(/^\[Gushio] Error while running '.*acceptance_sample_2.js': This script can fail badly\n$/)
    })

    test('acceptance_sample_3.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_3', 'foo "bar a bar" quis quix quiz')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the args: ["foo","bar a bar",["quis","quix","quiz"]]\n')
    })

    test('acceptance_sample_4.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_4', '-s 123 -s 456 789 -t --first "foo foo"')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the options: {"second":["123","456","789"],"third":true,"first":"foo foo"}\n')
    })

    test('acceptance_sample_5.js', () => {
        const result = runScript(tmpDir, 'acceptance_sample_5')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('[Gushio] Checking dependencies\n' +
            '[Gushio] Installing dependency glob@latest\n' +
            '[Gushio] Dependency glob@latest successfully installed\n' +
            '[Gushio] Installing dependency check-odd@npm:is-odd@latest\n' +
            '[Gushio] Dependency check-odd@npm:is-odd@latest successfully installed\n' +
            'Written on console after requiring deps\n')
        const installedDeps = shelljs.ls(`${tmpDir}/.gushio/317f0a7c-sample_5/node_modules`)
        expect(installedDeps).toContain('check-odd')
        expect(installedDeps).toContain('glob')
    }, 15000)
})