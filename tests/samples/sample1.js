#!/usr/bin/gushio
module.exports = {
    cli: {
        name: 'sample1',
        description: 'A sample script for gushio',
        version: 'NO VERSION',
        afterHelp: 'Some additional info',
        arguments: [
            {name: '<quix>', description: 'the first argument', parser: async ([_]) => _.toUpperCase()},
            {name: '[quak...]', description: 'the second (and optional) argument', default: 69420, parser: async ([..._], def) => _.map(x => Number.parseInt(x)).reduce((x, y) => x+y, 0) + def}
        ],
        options: [
            {flags: '-f, --foo', description: 'the foo flag'},
            {flags: '-b, --bar [broom...]', description: 'the bar flag (optional)', default: 'no_broom', env: 'GUSHIO_BAR', parser: async ([..._]) => _.reduce((x, y) => x+y, '').toUpperCase()},
            {flags: '-B, --baz <baam>', description: 'the baz flag', choices: ['boom', 'beam']},
        ],
    },
    deps: [
        {name: 'is-odd'},
    ],
    run: async (args, options) => {
        const {default: odd} = await gushio.import('is-odd')

        console.log('args -->'.red, args)
        console.log('options -->'.green.bold, options)
        for (let i = 0; i < 10; i++) {
            console.log(`Test ${i.toString().bold} is odd: ${odd(i)}`.bgBlue.whiteBright)
        }

        const yamlString = YAML.stringify({some: 'key', other: [1, 123, {boom: 'asda', pippo: null}]})
        console.log(yamlString)

        const goog = await console.spinner(fetch('https://www.google.it'), 'Fetching google')
        console.log(await goog.text())

        const res = await console.input({type: 'input', name: 'something', message: 'Write something'})
        console.log(`something: ${res.something}`)
    },
}