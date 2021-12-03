#!/usr/bin/gushio -s
module.exports = {
    cli: {
        arguments: [
            {name: '<first_argument>'},
            {name: '<second_argument>'},
            {name: '<third_argument...>'},
        ]
    },
    run: async ({'shelljs': $, 'ansi-colors': c, 'enquirer': e}, args, options) => {
        console.log('These are the args: ' + JSON.stringify(args))
    },
}