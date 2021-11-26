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
    deps: { /* TODO */ },
    run: ({'shelljs': $, 'ansi-colors': c, 'enquirer': e}) => async (args, options) => {
        console.log(c.red('args -->'), args)
        console.log(c.green.bold('options -->'), options)
    },
}