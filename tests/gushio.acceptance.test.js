const fs = require('fs')
const os = require('os')
const path = require('path')
const shelljs = require('shelljs')

const executablePath = path.resolve(__dirname, '../cli/cli.js')
const samplesDir = path.resolve(__dirname, 'samples')
function runScript(scriptName, argsAndOpts = '') {
    return shelljs.exec(`node ${executablePath} -s ${samplesDir}/${scriptName}.js -- ${argsAndOpts}`)
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

    test('acceptance_sample_1.js', () => {
        const result = runScript('acceptance_sample_1')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('You have a message to read...\n')
        expect(shelljs.cat('temp_folder/message.txt').stdout).toBe('"this is a message from acceptance_sample_1"' + os.EOL)
    })

    test('acceptance_sample_2.js', () => {
        const result = runScript('acceptance_sample_2')
        expect(result.code).toBe(1)
        expect(result.stderr).toMatch(/^\[Gushio] Error while running '.*acceptance_sample_2.js': This script can fail badly\n$/)
    })

    test('acceptance_sample_3.js', () => {
        const result = runScript('acceptance_sample_3', 'foo "bar a bar" quis quix quiz')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the args: ["foo","bar a bar",["quis","quix","quiz"]]\n')
    })

    test('acceptance_sample_4.js', () => {
        const result = runScript('acceptance_sample_4', '-s 123 -s 456 789 -t --first "foo foo"')
        expect(result.code).toBe(0)
        expect(result.stdout).toBe('These are the options: {"second":["123","456","789"],"third":true,"first":"foo foo"}\n')
    })
})