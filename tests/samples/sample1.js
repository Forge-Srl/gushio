#!/usr/bin/gushio
module.exports = {
    cli: {
        name: 'sample1',
        description: 'A sample script for gushio',
        version: 'NO VERSION',
        afterHelp: 'Some additional info',
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '[quak]', description: 'the second (and optional) argument', default: 69420}
        ],
        options: [
            {flags: '-f, --foo', description: 'the foo flag'},
            {flags: '-b, --bar [broom]', description: 'the bar flag (optional)', default: 'no_broom', env: 'GUSHIO_BAR'},
            {flags: '-B, --baz <baam>', description: 'the baz flag', choices: ['boom', 'beam']},
        ],
    },
    deps: [
        {name: 'is-odd'},
    ],
    run: async (args, options) => {
        const c = require('ansi-colors')
        const odd = require('is-odd')
        const path = require('path')

        console.log(c.red('args -->'), args)
        console.log(c.green.bold('options -->'), options)
        for (let i = 0; i < 10; i++) {
            console.log(`Test ${i} is odd: ${odd(i)}`)
        }
    },
}