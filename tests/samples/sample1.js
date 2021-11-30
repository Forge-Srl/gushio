#!/usr/bin/gushio
module.exports = {
    cli: {
        name: 'sample1',
        description: 'A sample script for gushio',
        version: 'NO VERSION',
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '[quak]', description: 'the second (and optional) argument', default: 69420}
        ],
        options: [
            {flags: '-f, --foo', description: 'the foo flag'},
            {flags: '-b, --bar [broom]', description: 'the bar flag (optional)', default: 'no_broom'},
            {flags: '-B, --baz <baam>', description: 'the baz flag'},
        ],
    },
    deps: [
        {name: 'is-odd'},
    ],
    run: async ({'shelljs': $, 'ansi-colors': c, 'enquirer': e, 'is-odd': odd}, args, options) => {
        console.log(c.red('args -->'), args)
        console.log(c.green.bold('options -->'), options)
        console.log($ === require('shelljs'))
        for (let i = 0; i < 10; i++) {
            console.log(`Test ${i} is odd: ${odd(i)}`)
        }
    },
}