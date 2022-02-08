import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('parsingUtils', () => {
    let parseCommandLineArgsAndOpts

    beforeEach(async () => {
        parseCommandLineArgsAndOpts = (await import('../../utils/parsingUtils')).parseCommandLineArgsAndOpts
    })

    test.each([
        ['', []],
        ['singleArg', ['singleArg']],
        ['--flag value arg1 arg2', ['--flag', 'value', 'arg1', 'arg2']],
        ['  --flag  value arg1    arg2     ', ['--flag', 'value', 'arg1', 'arg2']],
        ['\t--flag  value\targ1  \t\t arg2\t', ['--flag', 'value', 'arg1', 'arg2']],
        ['\'arg1 with space\' arg2 arg3', ['arg1 with space', 'arg2', 'arg3']],
        ['"arg1 with space" arg2 arg3', ['arg1 with space', 'arg2', 'arg3']],
        ['arg1 \'arg2 with space\' arg3', ['arg1', 'arg2 with space', 'arg3']],
        ['arg1 "arg2 with space" arg3', ['arg1', 'arg2 with space', 'arg3']],
        ['arg1 arg2 \'arg3 with space\'', ['arg1', 'arg2', 'arg3 with space']],
        ['arg1 arg2 "arg3 with space"', ['arg1', 'arg2', 'arg3 with space']],
        ['arg1 "arg2\twith space" arg3', ['arg1', 'arg2\twith space', 'arg3']],
        ['arg1 \'arg2 \\\'with\\\' space\' arg3', ['arg1', 'arg2 \'with\' space', 'arg3']],
        ['arg1 \'arg2 "with" space\' arg3', ['arg1', 'arg2 "with" space', 'arg3']],
        ['arg1 "arg2 \\"with\\" space" arg3', ['arg1', 'arg2 "with" space', 'arg3']],
        ['arg1 "arg2 \'with\' space" arg3', ['arg1', 'arg2 \'with\' space', 'arg3']],
        ['arg1 "arg2 \'wi\\"th\' \\"spa\'ce\\"" arg3', ['arg1', 'arg2 \'wi"th\' "spa\'ce"', 'arg3']],
    ])('parseCommandLineArgsAndOpts %s', (argsString, argsArray) => {
        expect(parseCommandLineArgsAndOpts(argsString)).toStrictEqual(argsArray)
    })
})